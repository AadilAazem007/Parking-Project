import crypto from 'crypto';

const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

const userResource = async (users) => {
    return Promise.all(users.map(async (user) => ({
        id: encryptId(user.id),
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        address: user.address,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
    })));
};

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

  export { userResource, encryptId, decryptId }