/**
 * Nexum Ledger - Cypherpunk Reputation Protocol (Lite MVP v2.0)
 */

export * from './types';
export { KeyManager } from './crypto/KeyManager';
export { ReputationLedger } from './core/ReputationLedger';
export { TransactionPool } from './core/TransactionPool';
export { SmartContract } from './core/SmartContract';
export { OracleAttestationManager } from './core/OracleAttestation';
export { NexumProtocolManager } from './core/ProtocolManager';

import { NexumProtocolManager } from './core/ProtocolManager';
import { KeyManager } from './crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced MVP demonstration
 */
function demonstrateNexumProtocol() {
  console.log('\n🔒 NEXUM LEDGER - Cypherpunk Reputation Protocol (v2.0)\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Initialize protocol
  const protocol = new NexumProtocolManager();

  // Create identities
  console.log('📝 Creating Anonymous Identities...');
  const alice = KeyManager.generateIdentity();
  const bob = KeyManager.generateIdentity();
  const charlie = KeyManager.generateIdentity();
  const aliceKeyMgr = new KeyManager();
  const bobKeyMgr = new KeyManager();

  console.log(`  ✓ Alice:   ${alice.publicKey.slice(0, 16)}...`);
  console.log(`  ✓ Bob:     ${bob.publicKey.slice(0, 16)}...`);
  console.log(`  ✓ Charlie: ${charlie.publicKey.slice(0, 16)}...\n`);

  // Register operators
  console.log('👥 Registering Operators...');
  protocol.initialize(alice.publicKey);
  protocol.initialize(bob.publicKey);
  protocol.initialize(charlie.publicKey);
  console.log('  ✓ Operators registered\n');

  // Set balances for transactions
  console.log('💰 Initializing Balances...');
  protocol.setBalance(alice.publicKey, 1000);
  protocol.setBalance(bob.publicKey, 500);
  protocol.setBalance(charlie.publicKey, 750);
  console.log(
    `  ✓ Alice balance: ${protocol.getBalance(alice.publicKey)}`
  );
  console.log(
    `  ✓ Bob balance: ${protocol.getBalance(bob.publicKey)}\n`
  );

  // Record achievements
  console.log('🏆 Recording Achievements...');
  const ach1 = protocol.recordAchievement(alice.publicKey, {
    id: uuidv4(),
    operator: alice.publicKey,
    description: 'Completed first transaction',
    category: 'transaction',
    timestamp: Date.now(),
    proof: KeyManager.hashData('alice_tx_1'),
    score: 15,
  });

  const ach2 = protocol.recordAchievement(bob.publicKey, {
    id: uuidv4(),
    operator: bob.publicKey,
    description: 'Successful collaboration',
    category: 'collaboration',
    timestamp: Date.now(),
    proof: KeyManager.hashData('bob_collab_1'),
    score: 25,
  });

  console.log('  ✓ Achievements recorded (awaiting oracle verification)\n');

  // Verify achievements (oracle verification)
  console.log('⛓️  Oracle Verification...');
  protocol.verifyAchievement(ach1.id);
  protocol.verifyAchievement(ach2.id);
  console.log('  ✓ Achievements verified\n');

  // Create transaction
  console.log('💳 Creating Transaction...');
  const txResult = protocol.createTransaction(
    alice.publicKey,
    bob.publicKey,
    100,
    aliceKeyMgr,
    5 // fee
  );

  if (txResult.valid && txResult.transaction) {
    const txId = txResult.transaction.id;
    console.log(`  ✓ Transaction created: ${txId.slice(0, 8)}...`);

    // Confirm transaction
    const confirmed = protocol.confirmTransaction(txId, alice.publicKey);
    console.log(
      `  ✓ Transaction confirmed: ${confirmed}\n`
    );
  }

  // Create smart contract
  console.log('📜 Creating Smart Contract...');
  const contract = protocol.createContract(
    alice.publicKey,
    'Peer-to-Peer Trust Agreement',
    'Automated contract for verified operators',
    [
      {
        id: uuidv4(),
        type: 'reputation',
        operator: alice.publicKey,
        threshold: 10,
        operator_type: '>=',
      },
    ],
    [
      {
        id: uuidv4(),
        type: 'transfer',
        target: bob.publicKey,
        amount: 50,
      },
    ]
  );

  console.log(`  ✓ Contract created: ${contract.id.slice(0, 8)}...`);

  // Execute contract
  const execResult = protocol.executeContract(contract.id, () => true);
  console.log(
    `  ✓ Contract execution: ${execResult.success ? 'SUCCESS ✓' : 'FAILED ✗'}\n`
  );

  // Register oracle node
  console.log('🔗 Oracle Network...');
  protocol.registerOracleNode('chainlink-node-1');
  protocol.registerOracleNode('chainlink-node-2');
  console.log('  ✓ Oracle nodes registered\n');

  // Display reputation
  console.log('📊 Reputation Status:');
  const aliceRep = protocol.getReputation(alice.publicKey);
  const bobRep = protocol.getReputation(bob.publicKey);
  console.log(`  Alice: Score=${aliceRep?.score}, Level=${aliceRep?.level}`);
  console.log(`  Bob:   Score=${bobRep?.score}, Level=${bobRep?.level}\n`);

  // Display leaderboard
  console.log('🏅 Reputation Leaderboard:');
  const leaderboard = protocol.getLeaderboard(5);
  leaderboard.forEach((record, index) => {
    console.log(
      `  ${index + 1}. ${record.operator.slice(0, 14)}... (Score: ${record.score}, Level: ${record.level})`
    );
  });
  console.log();

  // Display network stats
  console.log('🌐 Network Statistics:');
  const stats = protocol.getNetworkStats();
  console.log(`  Total Operators: ${stats.totalOperators}`);
  console.log(`  Total Achievements: ${stats.totalAchievements}`);
  console.log(`  Average Reputation: ${stats.averageReputation}`);
  console.log(`  Total Transactions: ${stats.totalTransactions}\n`);

  // Display transaction pool stats
  console.log('💼 Transaction Pool:');
  const txStats = protocol.getTransactionStats();
  console.log(`  Confirmed: ${txStats.confirmed}`);
  console.log(`  Pending: ${txStats.pending}`);
  console.log(`  Failed: ${txStats.failed}\n`);

  // Display oracle stats
  console.log('📡 Oracle Statistics:');
  const oracleStats = protocol.getOracleStats();
  console.log(`  Registered Nodes: ${oracleStats.registeredNodes}`);
  console.log(`  Average Confidence: ${oracleStats.averageConfidence}%\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('✨ Nexum Ledger MVP v2.0 - Running Successfully!\n');
}

// Run demonstration
demonstrateNexumProtocol();
