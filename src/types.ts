/**
 * Core type definitions for Nexum Ledger
 */

export interface Identity {
  publicKey: string;  // Cryptographic public key
  nonce: string;      // Unique identifier
  created: number;    // Timestamp
}

export interface Achievement {
  id: string;                    // Unique achievement ID
  operator: string;              // Operator's public key
  description: string;           // Achievement description
  timestamp: number;             // When achieved
  proof: string;                 // Cryptographic proof
  verified: boolean;             // Oracle verification status
  score: number;                 // Reputation score (0-100)
}

export interface Attestation {
  id: string;                    // Attestation ID
  issuer: string;                // Issuer's public key
  subject: string;               // Subject's public key
  claim: string;                 // Attested claim
  signature: string;             // Digital signature
  timestamp: number;             // Issue timestamp
  expiry: number;                // Expiration timestamp
}

export interface ReputationRecord {
  operator: string;              // Operator's public key
  score: number;                 // Current reputation score
  achievements: string[];        // Achievement IDs
  attestations: string[];        // Attestation IDs
  lastUpdated: number;           // Last update timestamp
}

export interface Transaction {
  id: string;                    // Transaction ID
  from: string;                  // Sender's public key
  to: string;                    // Recipient's public key
  amount: number;                // Amount transferred
  signature: string;             // Digital signature
  timestamp: number;             // Transaction timestamp
  verified: boolean;             // Oracle verification
}
