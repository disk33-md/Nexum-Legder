/**
 * Transaction pool for payment processing with validation and state management
 */

import { Transaction, ValidationResult } from '../types';
import { KeyManager } from '../crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';

export class TransactionPool {
  private pending: Map<string, Transaction> = new Map();
  private confirmed: Map<string, Transaction> = new Map();
  private failed: Map<string, Transaction> = new Map();
  private nonces: Map<string, number> = new Map(); // Prevent replay attacks
  private balances: Map<string, number> = new Map(); // Simplified balance tracking
  private maxPoolSize: number = 1000;

  /**
   * Constructor
   */
  constructor() {
    // Initialize with some default balances for demo
    this.balances.set('genesis', 1000000);
  }

  /**
   * Create and sign a transaction
   */
  createTransaction(
    from: string,
    to: string,
    amount: number,
    signer: KeyManager,
    fee: number = 0
  ): ValidationResult & { transaction?: Transaction } {
    const validation = this.validateTransaction(from, to, amount, fee);
    if (!validation.valid) {
      return validation;
    }

    const nonce = (this.nonces.get(from) || 0) + 1;
    const txData = `${from}:${to}:${amount}:${fee}:${nonce}:${Date.now()}`;

    try {
      const signature = signer.sign(txData);

      const transaction: Transaction = {
        id: uuidv4(),
        from,
        to,
        amount,
        fee,
        signature,
        timestamp: Date.now(),
        verified: false,
        status: 'pending',
      };

      if (this.pending.size < this.maxPoolSize) {
        this.pending.set(transaction.id, transaction);
        this.nonces.set(from, nonce);
        return {
          valid: true,
          errors: [],
          timestamp: Date.now(),
          transaction,
        };
      } else {
        return {
          valid: false,
          errors: ['Transaction pool is full'],
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Signing failed: ${error}`],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Validate a transaction
   */
  private validateTransaction(
    from: string,
    to: string,
    amount: number,
    fee: number
  ): ValidationResult {
    const errors: string[] = [];

    if (!from || typeof from !== 'string') errors.push('Invalid sender address');
    if (!to || typeof to !== 'string') errors.push('Invalid recipient address');
    if (from === to) errors.push('Sender and recipient cannot be the same');
    if (amount <= 0) errors.push('Amount must be positive');
    if (fee < 0) errors.push('Fee cannot be negative');
    if (amount + fee > (this.balances.get(from) || 0)) {
      errors.push('Insufficient balance');
    }

    return {
      valid: errors.length === 0,
      errors,
      timestamp: Date.now(),
    };
  }

  /**
   * Confirm and settle a transaction
   */
  confirmTransaction(txId: string, publicKey: string): boolean {
    const tx = this.pending.get(txId);
    if (!tx) {
      throw new Error('Transaction not found in pending pool');
    }

    const txData = `${tx.from}:${tx.to}:${tx.amount}:${tx.fee || 0}:${(this.nonces.get(tx.from) || 0)}:${tx.timestamp}`;
    const isValid = KeyManager.verify(txData, tx.signature, publicKey);

    if (isValid) {
      // Update balances
      const fromBalance = this.balances.get(tx.from) || 0;
      const toBalance = this.balances.get(tx.to) || 0;
      const totalDebit = tx.amount + (tx.fee || 0);

      if (fromBalance >= totalDebit) {
        this.balances.set(tx.from, fromBalance - totalDebit);
        this.balances.set(tx.to, toBalance + tx.amount);

        tx.verified = true;
        tx.status = 'confirmed';
        this.pending.delete(txId);
        this.confirmed.set(txId, tx);
        return true;
      } else {
        tx.status = 'failed';
        this.pending.delete(txId);
        this.failed.set(txId, tx);
        return false;
      }
    }

    tx.status = 'failed';
    this.pending.delete(txId);
    this.failed.set(txId, tx);
    return false;
  }

  /**
   * Get pending transactions
   */
  getPending(): Transaction[] {
    return Array.from(this.pending.values());
  }

  /**
   * Get confirmed transactions
   */
  getConfirmed(): Transaction[] {
    return Array.from(this.confirmed.values());
  }

  /**
   * Get failed transactions
   */
  getFailed(): Transaction[] {
    return Array.from(this.failed.values());
  }

  /**
   * Get transaction by ID
   */
  getTransaction(txId: string): Transaction | null {
    return (
      this.pending.get(txId) || this.confirmed.get(txId) || this.failed.get(txId) || null
    );
  }

  /**
   * Get balance of an address
   */
  getBalance(address: string): number {
    return this.balances.get(address) || 0;
  }

  /**
   * Set balance (for admin/testing)
   */
  setBalance(address: string, amount: number): void {
    if (amount < 0) {
      throw new Error('Balance cannot be negative');
    }
    this.balances.set(address, amount);
  }

  /**
   * Get transaction count
   */
  getTransactionCount(): { pending: number; confirmed: number; failed: number } {
    return {
      pending: this.pending.size,
      confirmed: this.confirmed.size,
      failed: this.failed.size,
    };
  }
}
