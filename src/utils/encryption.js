const crypto = require("crypto");
const config = require("../config"); // Import centralized config

// Key must be 32 characters (256 bits) for AES-256
const ENCRYPTION_KEY = config.encryptionKey;
const IV_LENGTH = 16; // AES block size is always 16 bytes

// @desc    Encrypt a string (Used for JWT Payload)
const encrypt = (text) => {
  // 1. Generate a random Initialization Vector (IV)
  // This ensures that the same text encrypts differently every time
  const iv = crypto.randomBytes(IV_LENGTH);

  // 2. Create the cipher
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );

  // 3. Encrypt the text
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // 4. Return IV:EncryptedText (We need the IV to decrypt later)
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// @desc    Decrypt a string (Used in Auth Middleware)
const decrypt = (text) => {
  try {
    // 1. Split the IV from the Encrypted Text
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    // 2. Create the decipher
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );

    // 3. Decrypt
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    // If decryption fails (e.g. wrong key or bad data), return null or throw
    throw new Error("Decryption Failed: Invalid Token Data");
  }
};

module.exports = { encrypt, decrypt };
