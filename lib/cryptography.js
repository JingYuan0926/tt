import crypto from 'crypto';
import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

// Initialize elliptic curve (using secp256k1 - same as Bitcoin)
const ec = new EC('secp256k1');

/**
 * Generate a salt for password hashing
 * @returns {string} Random salt
 */
export function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash password using elliptic curve cryptography
 * This implementation uses ECDSA key generation with password as seed
 * @param {string} password - The password to hash
 * @param {string} salt - Optional salt (if not provided, generates new one)
 * @returns {Object} Object containing hash, salt, and public key
 */
export function hashPasswordECC(password, salt = null) {
  try {
    // Generate salt if not provided
    if (!salt) {
      salt = generateSalt();
    }

    // Create a deterministic seed from password and salt
    const passwordSalt = password + salt;
    const seed = CryptoJS.SHA256(passwordSalt).toString();

    // Generate key pair from the seed
    const keyPair = ec.keyFromPrivate(seed);
    const publicKey = keyPair.getPublic('hex');
    const privateKeyHex = keyPair.getPrivate('hex');

    // Create additional hash using PBKDF2 for extra security
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

    // Combine ECC public key with PBKDF2 hash
    const combinedHash = CryptoJS.SHA256(publicKey + pbkdf2Hash).toString();

    return {
      hash: combinedHash,
      salt: salt,
      publicKey: publicKey,
      algorithm: 'ECC-secp256k1'
    };
  } catch (error) {
    throw new Error(`ECC hashing failed: ${error.message}`);
  }
}

/**
 * Verify password against ECC hash
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash
 * @param {string} salt - The salt used for hashing
 * @param {string} publicKey - The stored public key
 * @returns {boolean} True if password matches
 */
export function verifyPasswordECC(password, storedHash, salt, publicKey) {
  try {
    // Recreate the hash using the same process
    const passwordSalt = password + salt;
    const seed = CryptoJS.SHA256(passwordSalt).toString();

    // Generate key pair from the seed
    const keyPair = ec.keyFromPrivate(seed);
    const regeneratedPublicKey = keyPair.getPublic('hex');

    // Verify public key matches
    if (regeneratedPublicKey !== publicKey) {
      return false;
    }

    // Recreate PBKDF2 hash
    const pbkdf2Hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

    // Recreate combined hash
    const combinedHash = CryptoJS.SHA256(publicKey + pbkdf2Hash).toString();

    // Compare hashes
    return combinedHash === storedHash;
  } catch (error) {
    console.error('ECC verification failed:', error);
    return false;
  }
}

/**
 * Generate ECC key pair for user
 * @returns {Object} Key pair with public and private keys
 */
export function generateKeyPair() {
  const keyPair = ec.genKeyPair();
  return {
    publicKey: keyPair.getPublic('hex'),
    privateKey: keyPair.getPrivate('hex')
  };
}

/**
 * Sign data with private key
 * @param {string} data - Data to sign
 * @param {string} privateKey - Private key in hex format
 * @returns {string} Signature in hex format
 */
export function signData(data, privateKey) {
  try {
    const keyPair = ec.keyFromPrivate(privateKey);
    const hash = CryptoJS.SHA256(data).toString();
    const signature = keyPair.sign(hash);
    return signature.toDER('hex');
  } catch (error) {
    throw new Error(`Signing failed: ${error.message}`);
  }
}

/**
 * Verify signature with public key
 * @param {string} data - Original data
 * @param {string} signature - Signature in hex format
 * @param {string} publicKey - Public key in hex format
 * @returns {boolean} True if signature is valid
 */
export function verifySignature(data, signature, publicKey) {
  try {
    const keyPair = ec.keyFromPublic(publicKey, 'hex');
    const hash = CryptoJS.SHA256(data).toString();
    return keyPair.verify(hash, signature);
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
} 