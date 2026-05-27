/**
 * Transaction pool for payment processing
 */

import { Transaction } from '../types';
import { KeyManager } from '../crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';

export class TransactionPool {
  private pending: Map<string, Transaction> = new Map();
  private confirmed: Map<string, Transaction> = new Map();

  /**
   * Create and sign a transaction
   */
  createTransaction(
    from: string,
    to: string,
    amount: number,
    signer: KeyManager
  ): Transaction {
    const txData = `${from}:${to}:${amount}:${Date.now()}`;
    const signature = signer.sign(txData);

    const transaction: Transaction = {
      id: uuidv4(),
      from,
      to,
      amount,
      signature,
      timestamp: Date.now(),
      verified: false,
    };

    this.pending.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Verify and confirm a transaction
   */
  confirmTransaction(txId: string): boolean {
    const tx = this.pending.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    const txData = `${tx.from}:${tx.to}:${tx.amount}:${tx.timestamp}`;
    const isValid = KeyManager.verify(txData, tx.signature, tx.from);

    if (isValid) {
      tx.verified = true;
      this.pending.delete(txId);
      this.confirmed.set(txId, tx);
      return true;
    }

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
}
