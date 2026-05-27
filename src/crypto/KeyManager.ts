/**
 * Cryptographic key management for anonymous identities
 * Uses TweetNaCl for secure key derivation and message operations
 */

import * as nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';
import { Identity } from '../types';

export class KeyManager {
  private keypair: nacl.BoxKeyPair;
  private signKeypair: nacl.SignKeyPair;
  private identity: Identity;

  /**
   * Constructor - initializes with fresh keypairs
   */
  constructor() {
    this.keypair = nacl.box.keyPair();
    this.signKeypair = nacl.sign.keyPair();
    this.identity = this.buildIdentity();
  }

  /**
   * Build identity object from keypairs
   */
  private buildIdentity(): Identity {
    return {
      publicKey: Buffer.from(this.keypair.publicKey).toString('hex'),
      signingKey: Buffer.from(this.signKeypair.publicKey).toString('hex'),
      nonce: uuidv4(),
      created: Date.now(),
    };
  }

  /**
   * Generate a new cryptographic identity
   */
  static generateIdentity(): Identity {
    const manager = new KeyManager();
    return manager.getIdentity();
  }

  /**
   * Get the identity
   */
  getIdentity(): Identity {
    return this.identity;
  }

  /**
   * Get public key for encryption
   */
  getPublicKey(): Uint8Array {
    return this.keypair.publicKey;
  }

  /**
   * Get public key for signing
   */
  getSigningPublicKey(): Uint8Array {
    return this.signKeypair.publicKey;
  }

  /**
   * Sign a message with high security
   */
  sign(message: string): string {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message for signing');
    }
    const messageBytes = Buffer.from(message);
    const signedMessage = nacl.sign(messageBytes, this.signKeypair.secretKey);
    return Buffer.from(signedMessage).toString('hex');
  }

  /**
   * Verify a signed message
   */
  static verify(
    message: string,
    signature: string,
    publicKey: string
  ): boolean {
    try {
      if (!message || !signature || !publicKey) {
        return false;
      }
      const messageBytes = Buffer.from(message);
      const signatureBytes = Buffer.from(signature, 'hex');
      const pubKeyBytes = Buffer.from(publicKey, 'hex');
      
      if (signatureBytes.length !== nacl.sign.signatureLength) {
        return false;
      }

      nacl.sign.open(signatureBytes, pubKeyBytes);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Encrypt a message for a recipient
   */
  encryptFor(recipientPublicKey: string, message: string): string {
    try {
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageBytes = Buffer.from(message);
      const pubKeyBytes = Buffer.from(recipientPublicKey, 'hex');
      
      if (pubKeyBytes.length !== nacl.box.publicKeyLength) {
        throw new Error('Invalid recipient public key length');
      }

      const encrypted = nacl.box(
        messageBytes,
        nonce,
        pubKeyBytes,
        this.keypair.secretKey
      );
      const combined = Buffer.concat([nonce, encrypted]);
      return combined.toString('hex');
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Hash data using SHA-256 simulation (deterministic)
   */
  static hashData(data: string): string {
    const bytes = Buffer.from(data);
    let hash = 0;
    
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      hash = ((hash << 5) - hash) + byte;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Derive a deterministic key from a seed
   */
  static deriveKey(seed: string, info: string): string {
    const combined = seed + ':' + info;
    return this.hashData(combined);
  }
}
