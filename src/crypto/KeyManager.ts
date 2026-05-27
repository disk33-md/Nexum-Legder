/**
 * Cryptographic key management for anonymous identities
 */

import * as nacl from 'tweetnacl';
import { v4 as uuidv4 } from 'uuid';

export class KeyManager {
  private keypair: nacl.BoxKeyPair;
  private signKeypair: nacl.SignKeyPair;

  constructor() {
    this.keypair = nacl.box.keyPair();
    this.signKeypair = nacl.sign.keyPair();
  }

  /**
   * Generate a new cryptographic identity
   */
  static generateIdentity() {
    const manager = new KeyManager();
    return {
      publicKey: Buffer.from(manager.getPublicKey()).toString('hex'),
      nonce: uuidv4(),
      created: Date.now(),
    };
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
   * Sign a message
   */
  sign(message: string): string {
    const messageBytes = Buffer.from(message);
    const signedMessage = nacl.sign(messageBytes, this.signKeypair.secretKey);
    return Buffer.from(signedMessage).toString('hex');
  }

  /**
   * Verify a signed message
   */
  static verify(message: string, signature: string, publicKey: string): boolean {
    try {
      const messageBytes = Buffer.from(message);
      const signatureBytes = Buffer.from(signature, 'hex');
      const pubKeyBytes = Buffer.from(publicKey, 'hex');
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
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = Buffer.from(message);
    const pubKeyBytes = Buffer.from(recipientPublicKey, 'hex');
    const encrypted = nacl.box(
      messageBytes,
      nonce,
      pubKeyBytes,
      this.keypair.secretKey
    );
    const combined = Buffer.concat([nonce, encrypted]);
    return combined.toString('hex');
  }
}
