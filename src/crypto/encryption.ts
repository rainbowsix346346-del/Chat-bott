/**
 * Advanced Encryption Standard (AES-256-GCM) with PBKDF2 Key Derivation
 * Using the native browser Web Crypto API.
 */

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a user passphrase and salt using PBKDF2
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plain text string with a passphrase using AES-256-GCM
 */
export async function encryptText(
  plainText: string,
  passphrase: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Standard 96-bit IV for AES-GCM

  const key = await deriveKey(passphrase, salt);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(plainText)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using the passphrase, iv, and salt
 */
export async function decryptText(
  ciphertextBase64: string,
  ivBase64: string,
  saltBase64: string,
  passphrase: string
): Promise<string> {
  const decoder = new TextDecoder();
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(ciphertextBase64);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('رمز عبور اشتباه است یا داده‌ها مخدوش شده‌اند (Decryption failed)');
  }
}

/**
 * Encrypt an entire payload or object into an encrypted Vault file structure
 */
export async function createEncryptedVault(payload: any, passphrase: string): Promise<string> {
  const jsonString = JSON.stringify(payload);
  const encrypted = await encryptText(jsonString, passphrase);
  const vaultWrapper = {
    version: '1.0',
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    created: new Date().toISOString(),
    ...encrypted,
  };
  return JSON.stringify(vaultWrapper, null, 2);
}

/**
 * Decrypts an encrypted Vault file structure back to the original object
 */
export async function readEncryptedVault(vaultJsonString: string, passphrase: string): Promise<any> {
  const vault = JSON.parse(vaultJsonString);
  if (!vault.ciphertext || !vault.iv || !vault.salt) {
    throw new Error('فرمت فایل گاوصندوق رمزنگاری نامعتبر است');
  }
  const decryptedJson = await decryptText(vault.ciphertext, vault.iv, vault.salt, passphrase);
  return JSON.parse(decryptedJson);
}
