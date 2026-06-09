const ConsultationSummary = require('../models/ConsultationSummary');
const UserMemory = require('../models/UserMemory');
const Session = require('../models/Session');
const Message = require('../models/Message');
const admin = require('../config/firebase');
const { OpenAI } = require('openai');

let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
} catch (e) {
    console.error("Failed to initialize OpenAI:", e);
}

class AiInsightService {
    /**
     * Generate summary and update user memory after a session ends.
     * @param {string} sessionId 
     */
    static async generateSessionSummary(sessionId) {
        try {
            const session = await Session.findById(sessionId);
            if (!session) {
                console.error(`[AiInsightService] Session ${sessionId} not found.`);
                return;
            }

            // Only process if it's a chat session for now
            if (session.sessionType !== 'chat') {
                console.log(`[AiInsightService] Skipping summary for non-chat session ${sessionId} (type: ${session.sessionType})`);
                return;
            }

            // Fetch chat messages from Firebase Firestore
            const db = admin.firestore();
            const messagesSnapshot = await db.collection('chat_sessions')
                .doc(session.roomId)
                .collection('messages')
                .orderBy('createdAt', 'asc')
                .get();

            if (messagesSnapshot.empty) {
                console.log(`[AiInsightService] No messages found in Firebase for session ${sessionId} (roomId: ${session.roomId}). Skipping summary.`);
                return;
            }

            const transcript = messagesSnapshot.docs.map(doc => {
                const data = doc.data();
                const senderModel = data.senderModel || (data.senderId === session.astrologerId.toString() ? 'Astrologer' : 'User');
                const text = data.content || (data.fileUrl ? '[Sent a file/image]' : '[Empty Message]');
                return `${senderModel}: ${text}`;
            }).join('\n');

            // Fetch Existing User Memory first so we can merge
            let memory = await UserMemory.findOne({ userId: session.userId });
            if (!memory) {
                memory = new UserMemory({ userId: session.userId });
            }

            let aiResponse;
            if (openai) {
                try {
                    aiResponse = await this.generateOpenAIInsights(transcript, memory);
                } catch (err) {
                    console.error("[AiInsightService] OpenAI API failed, falling back to placeholder. Error:", err.message);
                    aiResponse = this.generatePlaceholderInsights(transcript);
                }
            } else {
                console.log("[AiInsightService] OPENAI_API_KEY not set. Falling back to placeholder insights.");
                aiResponse = this.generatePlaceholderInsights(transcript);
            }

            // Create ConsultationSummary
            const summary = await ConsultationSummary.create({
                sessionId: session._id,
                userId: session.userId,
                astrologerId: session.astrologerId,
                sessionType: session.sessionType,
                primaryConcerns: aiResponse.summary.primaryConcerns,
                recurringTopics: aiResponse.summary.recurringTopics,
                emotionalState: aiResponse.summary.emotionalState,
                frequentlyAskedQuestions: aiResponse.summary.frequentlyAskedQuestions,
                importantGuidance: aiResponse.summary.importantGuidance,
                keyLifeAreas: aiResponse.summary.keyLifeAreas,
                overview: aiResponse.summary.overview
            });

            // Combine existing memory with new merged insights
            memory.lastUpdated = new Date();
            memory.consultationCount += 1;
            memory.lastConsultationDate = new Date();

            memory.overallSummary = aiResponse.memoryUpdate.overallSummary;

            // Themes and historical arrays are intelligently merged by the prompt
            memory.themes = aiResponse.memoryUpdate.themes;
            memory.frequentQuestions = aiResponse.memoryUpdate.frequentQuestions;
            memory.importantGuidance = aiResponse.memoryUpdate.importantGuidance;

            memory.conversationTips = {
                openingQuestions: aiResponse.memoryUpdate.conversationTips.openingQuestions,
                followUpAreas: aiResponse.memoryUpdate.conversationTips.followUpAreas,
                reminders: aiResponse.memoryUpdate.conversationTips.reminders
            };

            // Invalidate any previously cached translations because memory has changed
            memory.translations = new Map();

            await memory.save();

            console.log(`[AiInsightService] Generated insights for session ${sessionId}`);
            return summary;
        } catch (error) {
            console.error(`[AiInsightService] Error generating summary for session ${sessionId}:`, error);
        }
    }

    static generatePlaceholderInsights(transcript) {
        // Placeholder logic to simulate AI processing
        return {
            summary: {
                primaryConcerns: ["Career growth", "Financial stability"],
                recurringTopics: ["Job change", "Promotions"],
                emotionalState: "Anxious but hopeful",
                frequentlyAskedQuestions: ["When will I get a new job?", "Is this a good time to invest?"],
                importantGuidance: "Advised to wait until next Jupiter transit before making big career moves.",
                keyLifeAreas: ["career", "finance"],
                overview: "User asked about career prospects and when they can expect a promotion. Discussed current planetary positions affecting job stability."
            },
            memoryUpdate: {
                overallSummary: "User is currently focused on career transitions and financial growth. Tends to ask about timing for job changes.",
                themes: ["career", "finance"],
                conversationTips: {
                    openingQuestions: ["How have your job applications been going since we last spoke?"],
                    followUpAreas: ["Check if they followed the remedy for Jupiter."],
                    reminders: ["Don't suggest immediate job changes as per previous reading."]
                }
            }
        };
    }

    static async generateOpenAIInsights(transcript, existingMemory) {
        // Step 1: Generate Session Summary ONLY
        const summaryResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant helping astrologers summarize their consultations. 
Given the transcript of an astrology consultation between an 'Astrologer' and a 'User', extract the required JSON structure accurately. Summarize the key life areas discussed, the user's emotional state, what they asked, and what guidance the astrologer gave.
Do not include any personal identifying information (PII).`
                },
                {
                    role: "user",
                    content: transcript
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "session_summary",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            primaryConcerns: { type: "array", items: { type: "string" } },
                            recurringTopics: { type: "array", items: { type: "string" } },
                            emotionalState: { type: "string" },
                            frequentlyAskedQuestions: { type: "array", items: { type: "string" } },
                            importantGuidance: { type: "string" },
                            keyLifeAreas: { type: "array", items: { type: "string" } },
                            overview: { type: "string" }
                        },
                        required: ["primaryConcerns", "recurringTopics", "emotionalState", "frequentlyAskedQuestions", "importantGuidance", "keyLifeAreas", "overview"],
                        additionalProperties: false
                    }
                }
            }
        });

        const sessionSummary = JSON.parse(summaryResponse.choices[0].message.content);

        // Step 2: Merge Memory & Generate Tips ONLY
        let memoryContext = "No existing user memory. This is the user's first session.";
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
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
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
                    role: "user",
                    content: `[EXISTING MEMORY]\n${memoryContext}\n\n[LATEST SESSION SUMMARY]\n${JSON.stringify(sessionSummary, null, 2)}`
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "memory_update",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            overallSummary: { type: "string" },
                            themes: { type: "array", items: { type: "string" } },
                            frequentQuestions: { type: "array", items: { type: "string" } },
                            importantGuidance: { type: "array", items: { type: "string" } },
                            conversationTips: {
                                type: "object",
                                properties: {
                                    openingQuestions: { type: "array", items: { type: "string" } },
                                    followUpAreas: { type: "array", items: { type: "string" } },
                                    reminders: { type: "array", items: { type: "string" } }
                                },
                                required: ["openingQuestions", "followUpAreas", "reminders"],
                                additionalProperties: false
                            }
                        },
                        required: ["overallSummary", "themes", "frequentQuestions", "importantGuidance", "conversationTips"],
                        additionalProperties: false
                    }
                }
            }
        });

        const memoryUpdate = JSON.parse(mergeResponse.choices[0].message.content);

        return {
            summary: sessionSummary,
            memoryUpdate: memoryUpdate
        };
    }

    /**
     * Translate the insights data into a target language using OpenAI.
     * @param {Object} insightsData The insights object containing memory and latestSummary
     * @param {string} targetLanguage The target language (e.g. 'Hindi', 'Telugu')
     */
    static async translateInsights(insightsData, targetLanguage) {
        if (!openai) {
            console.log("[AiInsightService] OPENAI_API_KEY not set. Cannot translate.");
            return insightsData;
        }

        try {
            const prompt = `Translate the following astrological consultation insights into ${targetLanguage}. Keep the exact same JSON structure, only translate the text content within the fields with good language. Ensure the translation sounds natural for an astrologer.
            
            JSON to translate:
            ${JSON.stringify(insightsData, null, 2)}`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are an expert astrological assistant translator. You translate text into the requested language while preserving the exact JSON structure." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error("[AiInsightService] Translation failed:", error.message);
            return insightsData; // Fallback to original
        }
    }
}

module.exports = AiInsightService;
