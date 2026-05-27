/**
 * Core reputation ledger - maintains operator reputation scores
 */

import { Achievement, ReputationRecord, Attestation } from '../types';
import { KeyManager } from '../crypto/KeyManager';

export class ReputationLedger {
  private records: Map<string, ReputationRecord> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private attestations: Map<string, Attestation> = new Map();
  private keyManager: KeyManager;

  constructor() {
    this.keyManager = new KeyManager();
  }

  /**
   * Register a new operator
   */
  registerOperator(publicKey: string): ReputationRecord {
    if (this.records.has(publicKey)) {
      throw new Error('Operator already registered');
    }

    const record: ReputationRecord = {
      operator: publicKey,
      score: 0,
      achievements: [],
      attestations: [],
      lastUpdated: Date.now(),
    };

    this.records.set(publicKey, record);
    return record;
  }

  /**
   * Record an achievement for an operator
   */
  recordAchievement(
    operator: string,
    achievement: Omit<Achievement, 'verified'>
  ): Achievement {
    const record = this.records.get(operator);
    if (!record) {
      throw new Error('Operator not found');
    }

    const fullAchievement: Achievement = {
      ...achievement,
      verified: false, // Awaiting oracle verification
    };

    this.achievements.set(achievement.id, fullAchievement);
    record.achievements.push(achievement.id);
    record.lastUpdated = Date.now();

    return fullAchievement;
  }

  /**
   * Verify an achievement (simulating oracle attestation)
   */
  verifyAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    achievement.verified = true;

    // Update reputation score
    const record = this.records.get(achievement.operator);
    if (record) {
      record.score += achievement.score;
      record.lastUpdated = Date.now();
    }
  }

  /**
   * Add an attestation
   */
  addAttestation(attestation: Attestation): void {
    const subject = this.records.get(attestation.subject);
    if (!subject) {
      throw new Error('Subject not found');
    }

    this.attestations.set(attestation.id, attestation);
    subject.attestations.push(attestation.id);
    subject.lastUpdated = Date.now();
  }

  /**
   * Get operator reputation
   */
  getReputation(operator: string): ReputationRecord | null {
    return this.records.get(operator) || null;
  }

  /**
   * Get achievement details
   */
  getAchievement(id: string): Achievement | null {
    return this.achievements.get(id) || null;
  }

  /**
   * Get top operators by reputation
   */
  getLeaderboard(limit: number = 10): ReputationRecord[] {
    return Array.from(this.records.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
