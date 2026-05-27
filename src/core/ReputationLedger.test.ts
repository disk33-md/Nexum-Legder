/**
 * Tests for ReputationLedger
 */

import { ReputationLedger } from './ReputationLedger';
import { v4 as uuidv4 } from 'uuid';

describe('ReputationLedger', () => {
  let ledger: ReputationLedger;
  const operatorKey = 'test_public_key_123';

  beforeEach(() => {
    ledger = new ReputationLedger();
  });

  test('should register a new operator', () => {
    const record = ledger.registerOperator(operatorKey);
    expect(record.operator).toBe(operatorKey);
    expect(record.score).toBe(0);
    expect(record.achievements).toHaveLength(0);
  });

  test('should not allow duplicate registration', () => {
    ledger.registerOperator(operatorKey);
    expect(() => ledger.registerOperator(operatorKey)).toThrow(
      'Operator already registered'
    );
  });

  test('should record an achievement', () => {
    ledger.registerOperator(operatorKey);
    const achievement = ledger.recordAchievement(operatorKey, {
      id: uuidv4(),
      operator: operatorKey,
      description: 'Test achievement',
      timestamp: Date.now(),
      proof: 'test_proof',
      score: 10,
    });

    expect(achievement.verified).toBe(false);
    const record = ledger.getReputation(operatorKey);
    expect(record?.achievements).toHaveLength(1);
  });

  test('should verify achievement and update score', () => {
    ledger.registerOperator(operatorKey);
    const achievement = ledger.recordAchievement(operatorKey, {
      id: uuidv4(),
      operator: operatorKey,
      description: 'Test achievement',
      timestamp: Date.now(),
      proof: 'test_proof',
      score: 25,
    });

    ledger.verifyAchievement(achievement.id);
    const record = ledger.getReputation(operatorKey);
    expect(record?.score).toBe(25);
  });

  test('should return leaderboard sorted by score', () => {
    const op1 = 'operator_1';
    const op2 = 'operator_2';
    const op3 = 'operator_3';

    ledger.registerOperator(op1);
    ledger.registerOperator(op2);
    ledger.registerOperator(op3);

    // Record and verify achievements
    const ach1 = ledger.recordAchievement(op1, {
      id: uuidv4(),
      operator: op1,
      description: 'Test',
      timestamp: Date.now(),
      proof: 'proof',
      score: 30,
    });

    const ach2 = ledger.recordAchievement(op2, {
      id: uuidv4(),
      operator: op2,
      description: 'Test',
      timestamp: Date.now(),
      proof: 'proof',
      score: 50,
    });

    ledger.verifyAchievement(ach1.id);
    ledger.verifyAchievement(ach2.id);

    const leaderboard = ledger.getLeaderboard(2);
    expect(leaderboard[0].score).toBe(50);
    expect(leaderboard[1].score).toBe(30);
  });
});
