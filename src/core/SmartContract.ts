/**
 * Smart contract execution engine for autonomous operations
 */

import { Contract, ContractCondition, ContractAction, ValidationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SmartContract {
  /**
   * Create a new smart contract
   */
  static create(
    creator: string,
    title: string,
    description: string,
    conditions: ContractCondition[],
    actions: ContractAction[],
    expiry?: number
  ): Contract {
    return {
      id: uuidv4(),
      creator,
      title,
      description,
      conditions,
      actions,
      state: {},
      executed: false,
      timestamp: Date.now(),
      expiry,
      signatures: [],
    };
  }

  /**
   * Validate a contract
   */
  static validate(contract: Contract): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!contract.creator) errors.push('Creator is required');
    if (!contract.title) errors.push('Title is required');
    if (!contract.conditions || contract.conditions.length === 0) {
      errors.push('At least one condition is required');
    }
    if (!contract.actions || contract.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Check expiry
    if (contract.expiry && contract.expiry <= Date.now()) {
      warnings.push('Contract has expired');
    }

    // Validate conditions
    contract.conditions?.forEach((cond, idx) => {
      if (!cond.type) errors.push(`Condition ${idx} missing type`);
      if (!cond.operator) errors.push(`Condition ${idx} missing operator`);
      if (cond.threshold === undefined) errors.push(`Condition ${idx} missing threshold`);
    });

    // Validate actions
    contract.actions?.forEach((action, idx) => {
      if (!action.type) errors.push(`Action ${idx} missing type`);
      if (action.type === 'transfer' && !action.target) {
        errors.push(`Action ${idx} transfer requires target`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: Date.now(),
    };
  }

  /**
   * Execute a contract if conditions are met
   */
  static execute(
    contract: Contract,
    evaluator: (condition: ContractCondition) => boolean
  ): { success: boolean; errors: string[]; executedActions: ContractAction[] } {
    // Check if already executed
    if (contract.executed) {
      return {
        success: false,
        errors: ['Contract already executed'],
        executedActions: [],
      };
    }

    // Check expiry
    if (contract.expiry && contract.expiry <= Date.now()) {
      return {
        success: false,
        errors: ['Contract has expired'],
        executedActions: [],
      };
    }

    // Evaluate all conditions
    const conditionResults = contract.conditions.map((cond) => {
      const result = evaluator(cond);
      cond.evaluationResult = result;
      return result;
    });

    const allMet = conditionResults.every((r) => r);

    if (!allMet) {
      return {
        success: false,
        errors: ['Not all contract conditions are met'],
        executedActions: [],
      };
    }

    // Execute actions
    const executedActions: ContractAction[] = [];
    const errors: string[] = [];

    for (const action of contract.actions) {
      try {
        action.executed = true;
        executedActions.push(action);
        contract.state[`action_${action.id}_result`] = 'success';
      } catch (error) {
        action.executed = false;
        errors.push(`Action ${action.id} failed: ${error}`);
      }
    }

    // Mark contract as executed
    contract.executed = true;
    contract.state['executedAt'] = Date.now();
    contract.state['conditions'] = contract.conditions;
    contract.state['actions'] = executedActions;

    return {
      success: errors.length === 0,
      errors,
      executedActions,
    };
  }

  /**
   * Add a signature for multi-sig support
   */
  static sign(contract: Contract, signature: string): void {
    if (!contract.signatures) {
      contract.signatures = [];
    }
    if (!contract.signatures.includes(signature)) {
      contract.signatures.push(signature);
    }
  }

  /**
   * Get contract summary
   */
  static summary(contract: Contract): string {
    return `Contract "${contract.title}" (${contract.id.slice(0, 8)}...): ` +
      `${contract.conditions.length} conditions, ` +
      `${contract.actions.length} actions, ` +
      `Status: ${contract.executed ? 'Executed' : 'Pending'}`;
  }
}
