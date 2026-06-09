const mongoose = require('mongoose');
const UserMemory = require('./src/models/UserMemory');
const ConsultationSummary = require('./src/models/ConsultationSummary');
require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = '6999e4c5f469fd0ea1d87c50';

    const existingMemory = await UserMemory.findOne({ userId });
    const sessionSummaryDoc = await ConsultationSummary.findOne({ userId }).sort({ createdAt: -1 });

    if (!existingMemory || !sessionSummaryDoc) {
        console.log('Missing memory or summary');
        process.exit();
    }

    const sessionSummary = sessionSummaryDoc.toObject();

    let memoryContext = 'No existing user memory. This is the users first session.';
    if (existingMemory && existingMemory.overallSummary) {
        memoryContext = `EXISTING USER MEMORY:
Overall Summary: ${existingMemory.overallSummary}
Themes: ${existingMemory.themes?.join(', ') || 'None'}
Frequent Questions: ${existingMemory.frequentQuestions?.join(', ') || 'None'}
Important Guidance: ${existingMemory.importantGuidance?.join(', ') || 'None'}
Consultation Count: ${existingMemory.consultationCount || 0}
Last Consultation: ${existingMemory.lastConsultationDate || 'Unknown'}
Opening Questions (Previous): ${existingMemory.conversationTips?.openingQuestions?.join(', ') || 'None'}`;
    }

    const mergeResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an AI assistant maintaining a continuous User Memory across sessions for an astrologer.
You are given the EXISTING USER MEMORY and the newly generated LATEST SESSION SUMMARY.
Your task is to:
1. Synthesize the user's ongoing journey into a concise 'overallSummary'.
2. Extract 'themes' by merging new topics without duplicating existing ones.
3. Preserve and update 'frequentQuestions' and 'importantGuidance' arrays based on recurring user questions and historically important guidance. Ensure you prioritize recent developments without losing critical historical context.
4. Generate fresh 'conversationTips' specifically for the NEXT session based on this merged context.

Rules for conversationTips:
- Generate only actionable tips.
- Avoid generic advice.
- Do not repeat the same tips every session.
- Focus on what has changed since the previous consultation.
- Highlight areas requiring follow-up.
- Remind the astrologer not to repeat previously provided guidance unless relevant.
- Prioritize the user's strongest recurring concerns.
- Maximum 5 tips.
- Each tip should be short and scannable.
- Return only the most useful recommendations for the next consultation.

Do NOT endlessly concatenate strings. Replace old tips entirely with fresh, dynamic recommendations. Maintain concise, astrologer-friendly memory.`
            },
            {
                role: 'user',
                content: `[EXISTING MEMORY]\n${memoryContext}\n\n[LATEST SESSION SUMMARY]\n${JSON.stringify(sessionSummary, null, 2)}`
            }
        ],
        response_format: {
            type: 'json_schema',
            json_schema: {
                name: 'memory_update',
                strict: true,
                schema: {
                    type: 'object',
                    properties: {
                        overallSummary: { type: 'string' },
                        themes: { type: 'array', items: { type: 'string' } },
                        frequentQuestions: { type: 'array', items: { type: 'string' } },
                        importantGuidance: { type: 'array', items: { type: 'string' } },
                        conversationTips: {
                            type: 'object',
                            properties: {
                                openingQuestions: { type: 'array', items: { type: 'string' } },
                                followUpAreas: { type: 'array', items: { type: 'string' } },
                                reminders: { type: 'array', items: { type: 'string' } }
                            },
                            required: ['openingQuestions', 'followUpAreas', 'reminders'],
                            additionalProperties: false
                        }
                    },
                    required: ['overallSummary', 'themes', 'frequentQuestions', 'importantGuidance', 'conversationTips'],
                    additionalProperties: false
                }
            }
        }
    });

    const memoryUpdate = JSON.parse(mergeResponse.choices[0].message.content);

    existingMemory.overallSummary = memoryUpdate.overallSummary;
    existingMemory.themes = memoryUpdate.themes;
    existingMemory.frequentQuestions = memoryUpdate.frequentQuestions;
    existingMemory.importantGuidance = memoryUpdate.importantGuidance;
    existingMemory.conversationTips = {
        openingQuestions: memoryUpdate.conversationTips.openingQuestions,
        followUpAreas: memoryUpdate.conversationTips.followUpAreas,
        reminders: memoryUpdate.conversationTips.reminders
    };

    existingMemory.translations = new Map();
    await existingMemory.save();
    console.log('Updated user memory and cleared translations cache!');
    process.exit();
}
run().catch(console.error);
