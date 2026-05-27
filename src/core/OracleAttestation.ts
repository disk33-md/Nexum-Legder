/**
 * Chainlink-compatible oracle attestation system
 */

import { OracleAttestation, ValidationResult } from '../types';
import { KeyManager } from '../crypto/KeyManager';
import { v4 as uuidv4 } from 'uuid';

export class OracleAttestationManager {
  private attestations: Map<string, OracleAttestation> = new Map();
  private requestIndex: Map<string, OracleAttestation> = new Map();
  private oracleNodes: Set<string> = new Set();

  /**
   * Register an oracle node
   */
  registerOracleNode(nodeAddress: string): void {
    if (!nodeAddress) {
      throw new Error('Invalid oracle node address');
    }
    this.oracleNodes.add(nodeAddress);
  }

  /**
   * Request attestation from oracle
   */
  requestAttestation(
    subject: string,
    claim: string,
    oracleNode: string
  ): ValidationResult & { requestId?: string } {
    // Validate inputs
    if (!subject || !claim || !oracleNode) {
      return {
        valid: false,
        errors: ['Invalid attestation parameters'],
        timestamp: Date.now(),
      };
    }

    if (!this.oracleNodes.has(oracleNode)) {
      return {
        valid: false,
        errors: ['Oracle node not registered'],
        timestamp: Date.now(),
      };
    }

    const requestId = KeyManager.deriveKey(subject, claim);

    return {
      valid: true,
      errors: [],
      timestamp: Date.now(),
      requestId,
    };
  }

  /**
   * Fulfill attestation request
   */
  fulfillAttestation(
    requestId: string,
    subject: string,
    claim: string,
    result: boolean,
    oracleNode: string,
    confidence: number = 100
  ): OracleAttestation {
    if (!this.oracleNodes.has(oracleNode)) {
      throw new Error('Oracle node not registered');
    }

    if (confidence < 0 || confidence > 100) {
      throw new Error('Confidence must be between 0 and 100');
    }

    const attestation: OracleAttestation = {
      id: uuidv4(),
      requestId,
      subject,
      claim,
      result,
      timestamp: Date.now(),
      oracleNode,
      confidence,
    };

    this.attestations.set(attestation.id, attestation);
    this.requestIndex.set(requestId, attestation);

    return attestation;
  }

  /**
   * Get attestation
   */
  getAttestation(attestationId: string): OracleAttestation | null {
    return this.attestations.get(attestationId) || null;
  }

  /**
   * Get attestation by request ID
   */
  getByRequestId(requestId: string): OracleAttestation | null {
    return this.requestIndex.get(requestId) || null;
  }

  /**
   * Get attestations by subject
   */
  getBySubject(subject: string): OracleAttestation[] {
    return Array.from(this.attestations.values()).filter((a) => a.subject === subject);
  }

  /**
   * Get attestations by oracle node
   */
  getByOracleNode(nodeAddress: string): OracleAttestation[] {
    return Array.from(this.attestations.values()).filter(
      (a) => a.oracleNode === nodeAddress
    );
  }

  /**
   * Verify attestation integrity
   */
  verifyAttestation(attestation: OracleAttestation): boolean {
    return (
      this.oracleNodes.has(attestation.oracleNode) &&
      attestation.confidence > 0 &&
      attestation.timestamp > 0
    );
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalAttestations: number;
    registeredNodes: number;
    averageConfidence: number;
    successRate: number;
  } {
    const attestations = Array.from(this.attestations.values());
    const successCount = attestations.filter((a) => a.result).length;

    return {
      totalAttestations: attestations.length,
      registeredNodes: this.oracleNodes.size,
      averageConfidence:
        attestations.length > 0
          ? Math.round(
              attestations.reduce((sum, a) => sum + a.confidence, 0) / attestations.length
            )
          : 0,
      successRate:
        attestations.length > 0
          ? Math.round((successCount / attestations.length) * 100)
          : 0,
    };
  }
}
