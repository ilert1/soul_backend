import * as crypto from 'crypto';

//Функция для генерации hash из объекта
export function getObjectHash(obj: object): string {
  return encrypt(JSON.stringify(obj));
}

//Функция получения объекта из hash
export function getObjectFromHash(hash: string): any {
  return JSON.parse(decrypt(hash));
}

// Функция для шифрования строки
export function encrypt(text: string): string {
  const HASH_SALT = process.env.HASH_SALT || 'your_hash_salt';

  const key = deriveKeyFromSalt(HASH_SALT); // Генерируем ключ из соли
  const iv = crypto
    .createHash('sha256')
    .update(HASH_SALT)
    .digest()
    .slice(0, 16); // Генерируем IV из соли (16 байт)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

// Функция для генерации ключа на основе соли
function deriveKeyFromSalt(salt: string) {
  const keyLength = 32; // AES-256 requires a 32-byte key
  const CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD || 'your_crypto_password';

  return crypto.pbkdf2Sync(CRYPTO_PASSWORD, salt, 100000, keyLength, 'sha256'); // PBKDF2 с SHA-256
}

// Функция для расшифровки строки
export function decrypt(encryptedText: string) {
  const HASH_SALT = process.env.HASH_SALT || 'your_hash_salt';

  const key = deriveKeyFromSalt(HASH_SALT); // Генерируем ключ из соли
  const iv = crypto
    .createHash('sha256')
    .update(HASH_SALT)
    .digest()
    .slice(0, 16); // Генерируем IV из соли (16 байт)
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
