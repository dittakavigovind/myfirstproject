const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    if (!content.includes('MESSAGE_ENCRYPTION_KEY=')) {
        const newKey = crypto.randomBytes(32).toString('hex').slice(0, 32);
        content += `\n# Added for Chat Message Encryption\nMESSAGE_ENCRYPTION_KEY=${newKey}\n`;
        fs.writeFileSync(envPath, content);
        console.log('Appended MESSAGE_ENCRYPTION_KEY to .env');
    } else {
        console.log('MESSAGE_ENCRYPTION_KEY already exists in .env');
    }
}
