/**
 * Comprehensive tests for ReputationLedger
 */

import { ReputationLedger } from './ReputationLedger';
import { v4 as uuidv4 } from 'uuid';

describe('ReputationLedger', () => {
  let ledger: ReputationLedger;
  const operatorKey = 'test_public_key_1234567890abcdef';
  const operator2Key = 'test_public_key_abcdefg1234567890';

  beforeEach(() => {
    ledger = new ReputationLedger();
  });

  describe('Operator Management', () => {
    test('should register a new operator', () => {
      const record = ledger.registerOperator(operatorKey);
      expect(record.operator).toBe(operatorKey);
      expect(record.score).toBe(0);
      expect(record.level).toBe('novice');
      expect(record.achievements).toHaveLength(0);
    });

    test('should not allow duplicate registration', () => {
      ledger.registerOperator(operatorKey);
      expect(() => ledger.registerOperator(operatorKey)).toThrow(
        'Operator already registered'
      );
    });

    test('should validate public key format', () => {
      expect(() => ledger.registerOperator('short')).toThrow('Invalid public key format');
      expect(() => ledger.registerOperator('')).toThrow('Invalid public key format');
    });
  });

  describe('Achievement System', () => {
    beforeEach(() => {
      ledger.registerOperator(operatorKey);
    });

    test('should record an achievement', () => {
      const achievement = ledger.recordAchievement(operatorKey, {
        id: uuidv4(),
        operator: operatorKey,
        description: 'Test achievement',
        category: 'transaction',
        timestamp: Date.now(),
        proof: 'test_proof_hash',
        score: 10,
      });

      expect(achievement.verified).toBe(false);
      const record = ledger.getReputation(operatorKey);
      expect(record?.achievements).toHaveLength(1);
    });

    test('should verify achievement and update score', () => {
      const achievement = ledger.recordAchievement(operatorKey, {
        id: uuidv4(),
        operator: operatorKey,
        description: 'Test achievement',
        category: 'verification',
        timestamp: Date.now(),
        proof: 'test_proof_hash',
        score: 25,
      });

      ledger.verifyAchievement(achievement.id);
      const record = ledger.getReputation(operatorKey);
      expect(record?.score).toBe(25);
    });

    test('should update reputation level', () => {
      // Record multiple achievements to reach higher levels
      for (let i = 0; i < 25; i++) {
        const ach = ledger.recordAchievement(operatorKey, {
          id: uuidv4(),
          operator: operatorKey,
          description: `Achievement ${i}`,
          category: 'custom',
          timestamp: Date.now(),
          proof: `proof_${i}`,
          score: 20,
        });
        ledger.verifyAchievement(ach.id);
      }

      const record = ledger.getReputation(operatorKey);
      expect(record?.score).toBeGreaterThanOrEqual(200);
      expect(record?.level).toBe('verified');
    });
  });

  describe('Leaderboard', () => {
    test('should return sorted leaderboard', () => {
      const op1 = 'operator_1_1234567890abcdef';
      const op2 = 'operator_2_1234567890abcdef';
      const op3 = 'operator_3_1234567890abcdef';

      ledger.registerOperator(op1);
      ledger.registerOperator(op2);
      ledger.registerOperator(op3);

      // Add achievements with different scores
      const ach1 = ledger.recordAchievement(op1, {
        id: uuidv4(),
        operator: op1,
        description: 'Test',
        category: 'transaction',
        timestamp: Date.now(),
        proof: 'proof1',
        score: 30,
      });

      const ach2 = ledger.recordAchievement(op2, {
        id: uuidv4(),
        operator: op2,
        description: 'Test',
        category: 'collaboration',
        timestamp: Date.now(),
        proof: 'proof2',
        score: 50,
      });

      ledger.verifyAchievement(ach1.id);
      ledger.verifyAchievement(ach2.id);

      const leaderboard = ledger.getLeaderboard(2);
      expect(leaderboard[0].score).toBe(50);
      expect(leaderboard[1].score).toBe(30);
      expect(leaderboard).toHaveLength(2);
    });
  });

  describe('Network Statistics', () => {
    test('should calculate network stats', () => {
      ledger.registerOperator(operatorKey);
      ledger.registerOperator(operator2Key);

      const stats = ledger.getNetworkStats();
      expect(stats.totalOperators).toBe(2);
      expect(stats.averageReputation).toBe(0);
      expect(stats.totalAchievements).toBe(0);
    });
  });

  describe('Attestations', () => {
    test('should add attestation and boost reputation', () => {
      ledger.registerOperator(operatorKey);

      ledger.addAttestation({
        id: uuidv4(),
        issuer: operator2Key,
        subject: operatorKey,
        claim: 'Verified operator',
        signature: 'test_signature',
        timestamp: Date.now(),
        expiry: Date.now() + 86400000,
        revoked: false,
        confidence: 80,
      });

      const record = ledger.getReputation(operatorKey);
      expect(record?.attestations).toHaveLength(1);
      expect(record?.score).toBeGreaterThan(0);
    });
  });
});
