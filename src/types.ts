/**
 * Core type definitions for Nexum Ledger
 */

export interface Identity {
  publicKey: string;              // Cryptographic public key
  signingKey: string;             // Signing key (hex)
  nonce: string;                  // Unique identifier
  created: number;                // Timestamp
  metadata?: Record<string, unknown>; // Optional metadata
}

export interface Achievement {
  id: string;                     // Unique achievement ID
  operator: string;               // Operator's public key
  description: string;            // Achievement description
  category: 'transaction' | 'collaboration' | 'verification' | 'custom';
  timestamp: number;              // When achieved
  proof: string;                  // Cryptographic proof hash
  verified: boolean;              // Oracle verification status
  score: number;                  // Reputation score (0-100)
  oracleAttestation?: string;     // Chainlink oracle reference
  metadata?: Record<string, unknown>; // Additional data
}

export interface Attestation {
  id: string;                     // Attestation ID
  issuer: string;                 // Issuer's public key
  subject: string;                // Subject's public key
  claim: string;                  // Attested claim
  signature: string;              // Digital signature
  timestamp: number;              // Issue timestamp
  expiry: number;                 // Expiration timestamp
  revoked: boolean;               // Revocation status
  confidence: number;             // Confidence score (0-100)
}

export interface ReputationRecord {
  operator: string;               // Operator's public key
  score: number;                  // Current reputation score
  level: 'novice' | 'trusted' | 'verified' | 'elite'; // Reputation tier
  achievements: string[];         // Achievement IDs
  attestations: string[];         // Attestation IDs
  totalTransactions: number;      // Lifetime transaction count
  successRate: number;            // Success percentage (0-100)
  lastUpdated: number;            // Last update timestamp
  metadata?: Record<string, unknown>;
}

export interface Transaction {
  id: string;                     // Transaction ID
  from: string;                   // Sender's public key
  to: string;                     // Recipient's public key
  amount: number;                 // Amount transferred
  signature: string;              // Digital signature
  timestamp: number;              // Transaction timestamp
  verified: boolean;              // Oracle verification
  status: 'pending' | 'confirmed' | 'failed'; // Transaction status
  fee?: number;                   // Optional transaction fee
  metadata?: Record<string, unknown>;
}

export interface Contract {
  id: string;                     // Contract ID
  creator: string;                // Creator's public key
  title: string;                  // Contract title
  description: string;            // Contract description
  conditions: ContractCondition[]; // Execution conditions
  actions: ContractAction[];      // Actions to execute
  state: Record<string, unknown>; // Current state
  executed: boolean;              // Execution status
  timestamp: number;              // Creation timestamp
  expiry?: number;                // Optional expiration
  signatures?: string[];          // Multi-sig support
}

export interface ContractCondition {
  id: string;                     // Condition ID
  type: 'reputation' | 'balance' | 'attestation' | 'custom'; // Type
  operator: string;               // Operator's public key
  threshold: number;              // Comparison value
  operator_type?: '>' | '>=' | '<' | '<=' | '==' | '!='; // Comparison operator
  evaluationResult?: boolean;     // Cached evaluation
}

export interface ContractAction {
  id: string;                     // Action ID
  type: 'transfer' | 'mint' | 'execute' | 'custom'; // Action type
  target: string;                 // Target recipient
  amount?: number;                // Amount for transfers
  data?: Record<string, unknown>; // Custom data
  executed?: boolean;             // Execution status
}

export interface OracleAttestation {
  id: string;                     // Attestation ID
  requestId: string;              // Oracle request ID
  subject: string;                // Subject being attested
  claim: string;                  // The claim being verified
  result: boolean;                // Verification result
  timestamp: number;              // When verified
  oracleNode: string;             // Oracle node address
  confidence: number;             // Confidence score (0-100)
}

export interface NetworkStats {
  totalOperators: number;         // Total registered operators
  totalAchievements: number;      // Total achievements
  totalTransactions: number;      // Total transactions
  totalAttestations: number;      // Total attestations
  averageReputation: number;      // Average reputation score
  lastUpdated: number;            // Timestamp of last update
}

export interface ValidationResult {
  valid: boolean;                 // Is valid
  errors: string[];               // Error messages
  warnings?: string[];            // Warning messages
  timestamp: number;              // Validation time
}
