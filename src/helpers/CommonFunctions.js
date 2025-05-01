import crypto from 'crypto';
import 'dotenv/config';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
// console.log(crypto.randomBytes(32).toString('hex'))
const IV_LENGTH = 16;

function encryptId(id) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(id.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}


function decryptId(encryptedId) {
    try {
        if (!encryptedId || typeof encryptedId !== 'string' || !encryptedId.includes(':')) {
            throw new Error('Invalid encrypted ID format');
        }
        const parts = encryptedId.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted ID format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        if (iv.length !== IV_LENGTH) {
            throw new Error('Invalid IV length');
        }
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}


function validateFields(fields) {
    for(const[key, value] of Object.entries(fields))
    {
        if (!value) {
            return `${key} is required`;
        }
    }
}



export { encryptId, decryptId, validateFields }