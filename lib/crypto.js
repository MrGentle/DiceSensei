const crypto = require("crypto");
const { ENCRYPTION_KEY, ENCRYPTION_ALGORITHM } = require('../config.json'); 

const encrypt = (data) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    let encryptedData = cipher.update(JSON.stringify(data), "utf-8", 'hex');
    encryptedData += cipher.final("hex");
    return {
        data: encryptedData,
        iv: iv.toString('hex')
    }
}

const decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, Buffer.from(encryptedData.iv, 'hex'));
    let decryptedData = decipher.update(encryptedData.data, "hex", "utf-8");
    decryptedData += decipher.final("utf-8");
    return JSON.parse(decryptedData);
}

module.exports = {
    encrypt,
    decrypt
}