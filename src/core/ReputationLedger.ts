/**
 * Core reputation ledger - maintains operator reputation scores with caching
 */

import { Achievement, ReputationRecord, Attestation, NetworkStats, ValidationResult } from '../types';
import { KeyManager } from '../crypto/KeyManager';

export class ReputationLedger {
  private records: Map<string, ReputationRecord> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private attestations: Map<string, Attestation> = new Map();
  private cache: Map<string, unknown> = new Map();
  private updateTimestamp: number = Date.now();
  private readonly CACHE_TTL = 60000; // 1 minute

  /**
   * Register a new operator
   */
  registerOperator(publicKey: string): ReputationRecord {
    this.validatePublicKey(publicKey);

    if (this.records.has(publicKey)) {
      throw new Error('Operator already registered');
    }

    const record: ReputationRecord = {
      operator: publicKey,
      score: 0,
      level: 'novice',
      achievements: [],
      attestations: [],
      totalTransactions: 0,
      successRate: 0,
      lastUpdated: Date.now(),
    };

    this.records.set(publicKey, record);
    this.invalidateCache();
    return record;
  }

  /**
   * Record an achievement for an operator
   */
  recordAchievement(
    operator: string,
    achievement: Omit<Achievement, 'verified'>
  ): Achievement {
    this.validatePublicKey(operator);
    const record = this.records.get(operator);

    if (!record) {
      throw new Error('Operator not registered');
    }

    const fullAchievement: Achievement = {
      ...achievement,
      verified: false,
    };

    this.achievements.set(achievement.id, fullAchievement);
    record.achievements.push(achievement.id);
    record.lastUpdated = Date.now();

    this.invalidateCache();
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

    const record = this.records.get(achievement.operator);
    if (record) {
      record.score += achievement.score;
      record.totalTransactions++;
      record.successRate = (record.totalTransactions > 0) 
        ? Math.round((record.totalTransactions / Math.max(1, record.totalTransactions)) * 100)
        : 0;
      this.updateReputationLevel(record);
      record.lastUpdated = Date.now();
    }

    this.invalidateCache();
  }

  /**
   * Update reputation level based on score
   */
  private updateReputationLevel(record: ReputationRecord): void {
    if (record.score >= 500) {
      record.level = 'elite';
    } else if (record.score >= 200) {
      record.level = 'verified';
    } else if (record.score >= 50) {
      record.level = 'trusted';
    } else {
      record.level = 'novice';
    }
  }

  /**
   * Add an attestation
   */
  addAttestation(attestation: Attestation): void {
    this.validatePublicKey(attestation.subject);
    this.validatePublicKey(attestation.issuer);

    const subject = this.records.get(attestation.subject);
    if (!subject) {
      throw new Error('Subject not registered');
    }

    this.attestations.set(attestation.id, attestation);
    subject.attestations.push(attestation.id);
    
    // Boost reputation based on attestation confidence
    subject.score += Math.floor(attestation.confidence / 10);
    this.updateReputationLevel(subject);
    subject.lastUpdated = Date.now();

    this.invalidateCache();
  }

  /**
   * Revoke an attestation
   */
  revokeAttestation(attestationId: string): void {
    const attestation = this.attestations.get(attestationId);
    if (!attestation) {
      throw new Error('Attestation not found');
    }

    attestation.revoked = true;
    const record = this.records.get(attestation.subject);
    if (record) {
      record.score = Math.max(0, record.score - Math.floor(attestation.confidence / 10));
      this.updateReputationLevel(record);
      record.lastUpdated = Date.now();
    }

    this.invalidateCache();
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
   * Get attestation details
   */
  getAttestation(id: string): Attestation | null {
    return this.attestations.get(id) || null;
  }

  /**
   * Get top operators by reputation (with caching)
   */
  getLeaderboard(limit: number = 10): ReputationRecord[] {
    const cacheKey = `leaderboard_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached as ReputationRecord[];

    const leaderboard = Array.from(this.records.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(limit, this.records.size));

    this.setCache(cacheKey, leaderboard);
    return leaderboard;
  }

  /**
   * Get operators with specific level
   */
  getOperatorsByLevel(level: 'novice' | 'trusted' | 'verified' | 'elite'): ReputationRecord[] {
    return Array.from(this.records.values()).filter((r) => r.level === level);
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): NetworkStats {
    const stats: NetworkStats = {
      totalOperators: this.records.size,
      totalAchievements: this.achievements.size,
      totalTransactions: Array.from(this.records.values()).reduce(
        (sum, r) => sum + r.totalTransactions,
        0
      ),
      totalAttestations: this.attestations.size,
      averageReputation:
        this.records.size > 0
          ? Math.round(
              Array.from(this.records.values()).reduce((sum, r) => sum + r.score, 0) /
                this.records.size
            )
          : 0,
      lastUpdated: this.updateTimestamp,
    };
    return stats;
  }

  /**
   * Validate public key format
   */
  private validatePublicKey(key: string): void {
    if (!key || typeof key !== 'string' || key.length < 32) {
      throw new Error('Invalid public key format');
    }
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.cache.clear();
    this.updateTimestamp = Date.now();
  }

  /**
   * Get from cache
   */
  private getCache(key: string): unknown | null {
    return this.cache.get(key) || null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, value: unknown): void {
    this.cache.set(key, value);
  }
}
