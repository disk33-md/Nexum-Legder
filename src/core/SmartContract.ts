/**
 * Smart contract execution engine for autonomous operations
 */

import { v4 as uuidv4 } from 'uuid';

export interface ContractState {
  [key: string]: unknown;
}

export interface ContractCondition {
  type: 'reputation' | 'balance' | 'attestation';
  operator: string;
  threshold: number;
}

export class SmartContract {
  id: string;
  creator: string;
  state: ContractState = {};
  conditions: ContractCondition[];
  executed: boolean = false;
  timestamp: number;

  constructor(creator: string, conditions: ContractCondition[]) {
    this.id = uuidv4();
    this.creator = creator;
    this.conditions = conditions;
    this.timestamp = Date.now();
  }

  /**
   * Execute contract if all conditions are met
   */
  execute(evaluator: (condition: ContractCondition) => boolean): boolean {
    if (this.executed) {
      throw new Error('Contract already executed');
    }

    const allConditionsMet = this.conditions.every(evaluator);

    if (allConditionsMet) {
      this.executed = true;
      this.state['executedAt'] = Date.now();
      return true;
    }

    return false;
  }

  /**
   * Update contract state
   */
  updateState(key: string, value: unknown): void {
    if (this.executed) {
      throw new Error('Cannot update executed contract');
    }
    this.state[key] = value;
  }
}
