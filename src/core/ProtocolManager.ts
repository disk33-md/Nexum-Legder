/**
 * High-level protocol manager integrating all components
 */

import { ReputationLedger } from './ReputationLedger';
import { TransactionPool } from './TransactionPool';
import { SmartContract } from './SmartContract';
import { OracleAttestationManager } from './OracleAttestation';
import { KeyManager } from '../crypto/KeyManager';
import { Identity, Contract, ContractCondition, ContractAction } from '../types';

export class NexumProtocolManager {
  private ledger: ReputationLedger;
  private txPool: TransactionPool;
  private oracle: OracleAttestationManager;
  private contracts: Map<string, Contract> = new Map();
  private identity: Identity | null = null;

  /**
   * Constructor
   */
  constructor() {
    this.ledger = new ReputationLedger();
    this.txPool = new TransactionPool();
    this.oracle = new OracleAttestationManager();
  }

  /**
   * Initialize protocol with operator identity
   */
  initialize(operatorKey: string): void {
    if (this.ledger.getReputation(operatorKey)) {
      throw new Error('Operator already initialized');
        }
    this.ledger.registerOperator(operatorKey);
  }

  /**
   * Create new identity
   */
  createIdentity(): Identity {
    return KeyManager.generateIdentity();
  }

  /**
   * Get reputation
   */
  getReputation(operator: string) {
    return this.ledger.getReputation(operator);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit?: number) {
    return this.ledger.getLeaderboard(limit);
  }

  /**
   * Get network stats
   */
  getNetworkStats() {
    return this.ledger.getNetworkStats();
  }

  /**
   * Record achievement
   */
  recordAchievement(operator: string, achievement: any) {
    return this.ledger.recordAchievement(operator, achievement);
  }

  /**
   * Verify achievement
   */
  verifyAchievement(achievementId: string): void {
    this.ledger.verifyAchievement(achievementId);
  }

  /**
   * Create transaction
   */
  createTransaction(
    from: string,
    to: string,
    amount: number,
    signer: KeyManager,
    fee?: number
  ) {
    return this.txPool.createTransaction(from, to, amount, signer, fee);
  }

  /**
   * Confirm transaction
   */
  confirmTransaction(txId: string, publicKey: string): boolean {
    return this.txPool.confirmTransaction(txId, publicKey);
  }

  /**
   * Get balance
   */
  getBalance(address: string): number {
    return this.txPool.getBalance(address);
  }

  /**
   * Set balance (for testing)
   */
  setBalance(address: string, amount: number): void {
    this.txPool.setBalance(address, amount);
  }

  /**
   * Create smart contract
   */
  createContract(
    creator: string,
    title: string,
    description: string,
    conditions: ContractCondition[],
    actions: ContractAction[],
    expiry?: number
  ): Contract {
    const contract = SmartContract.create(
      creator,
      title,
      description,
      conditions,
      actions,
      expiry
    );

    const validation = SmartContract.validate(contract);
    if (!validation.valid) {
      throw new Error(`Contract validation failed: ${validation.errors.join(', ')}`);
    }

    this.contracts.set(contract.id, contract);
    return contract;
  }

  /**
   * Execute smart contract
   */
  executeContract(
    contractId: string,
    evaluator: (condition: ContractCondition) => boolean
  ) {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    return SmartContract.execute(contract, evaluator);
  }

  /**
   * Register oracle node
   */
  registerOracleNode(nodeAddress: string): void {
    this.oracle.registerOracleNode(nodeAddress);
  }

  /**
   * Request oracle attestation
   */
  requestAttestation(subject: string, claim: string, oracleNode: string) {
    return this.oracle.requestAttestation(subject, claim, oracleNode);
  }

  /**
   * Get oracle stats
   */
  getOracleStats() {
    return this.oracle.getStatistics();
  }

  /**
   * Get transaction pool stats
   */
  getTransactionStats() {
    return this.txPool.getTransactionCount();
  }
}
