const crypto = require('crypto');

// Must be 32 bytes (256 bits)
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32); 
const IV_LENGTH = 16; // AES blocksize

class CryptoUtil {
    static encrypt(text) {
        if (!text) return null;
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
        let encrypted = cipher.update(text);
        
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    }

    static decrypt(text, ivHex) {
        if (!text || !ivHex) return null;
        try {
            let iv = Buffer.from(ivHex, 'hex');
            let encryptedText = Buffer.from(text, 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
            let decrypted = decipher.update(encryptedText);
            
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (e) {
            console.error("Decryption failed:", e.message);
            return "[Decryption Error]";
        }
    }
}

module.exports = CryptoUtil;
