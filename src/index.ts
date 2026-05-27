/**
 * Nexum Ledger - Cypherpunk Reputation Protocol
 */

export * from './types';
export { KeyManager } from './crypto/KeyManager';
export { ReputationLedger } from './core/ReputationLedger';
export { TransactionPool } from './core/TransactionPool';
export { SmartContract, ContractState, ContractCondition } from './core/SmartContract';

import { KeyManager } from './crypto/KeyManager';
import { ReputationLedger } from './core/ReputationLedger';
import { TransactionPool } from './core/TransactionPool';
import { SmartContract } from './core/SmartContract';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialize and demonstrate Nexum Ledger MVP
 */
function demonstrateProtocol() {
  console.log('🔐 Nexum Ledger - Cypherpunk Reputation Protocol\n');

  // Initialize components
  const ledger = new ReputationLedger();
  const txPool = new TransactionPool();
  const alice = KeyManager.generateIdentity();
  const bob = KeyManager.generateIdentity();

  console.log('✓ Generated anonymous identities');
  console.log(`  Alice: ${alice.publicKey.slice(0, 16)}...`);
  console.log(`  Bob:   ${bob.publicKey.slice(0, 16)}...\n`);

  // Register operators
  ledger.registerOperator(alice.publicKey);
  ledger.registerOperator(bob.publicKey);
  console.log('✓ Registered operators\n');

  // Record achievement
  const achievement = ledger.recordAchievement(alice.publicKey, {
    id: uuidv4(),
    operator: alice.publicKey,
    description: 'Completed peer-to-peer transaction',
    timestamp: Date.now(),
    proof: 'cryptographic_proof_hash',
    score: 10,
  });
  console.log('✓ Recorded achievement (awaiting oracle verification)\n');

  // Simulate oracle verification
  ledger.verifyAchievement(achievement.id);
  const reputation = ledger.getReputation(alice.publicKey);
  console.log('✓ Oracle verified achievement');
  console.log(`  Reputation score: ${reputation?.score}\n`);

  // Create smart contract
  const contract = new SmartContract(alice.publicKey, [
    {
      type: 'reputation',
      operator: alice.publicKey,
      threshold: 5,
    },
  ]);
  console.log('✓ Created smart contract with conditions\n');

  // Execute contract
  const isExecuted = contract.execute(() => true); // Simplified evaluation
  console.log(`✓ Contract execution: ${isExecuted ? 'SUCCESS' : 'FAILED'}\n`);

  // Leaderboard
  const leaderboard = ledger.getLeaderboard(5);
  console.log('📊 Reputation Leaderboard:');
  leaderboard.forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.operator.slice(0, 16)}... (Score: ${record.score})`);
  });
}

// Run demo
demonstrateProtocol();
