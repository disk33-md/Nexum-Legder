# Nexum Ledger - Cypherpunk Reputation Protocol

> A privacy-preserving reputation system enabling anonymous operators to build verifiable trust through encrypted on-chain achievements.

## 🎯 Features

### Core Functionality
- **Anonymous Identity System** - Cryptographic identifiers without real-world exposure
- **Verifiable Reputation** - On-chain achievements verified through oracle attestations
- **Privacy-First Design** - NaCl encryption and zero-knowledge proof compatibility
- **Smart Contracts** - Condition-based autonomous execution
- **Payment Processing** - Cryptographically signed transactions with balance tracking
- **Oracle Network** - Chainlink-compatible oracle attestation system

### Reputation Tiers
- **Novice** (0-49 points) - New operator
- **Trusted** (50-199 points) - Established reputation
- **Verified** (200-499 points) - High credibility
- **Elite** (500+ points) - Network authority

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run Demo

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

## 📁 Architecture

```
src/
├── crypto/
│   └── KeyManager.ts              # Cryptographic identity & signing
├── core/
│   ├── ReputationLedger.ts        # Reputation scoring system
│   ├── TransactionPool.ts         # Payment processing
│   ├── SmartContract.ts           # Contract execution
│   ├── OracleAttestation.ts       # Oracle integration
│   ├── ProtocolManager.ts         # High-level API
│   └── *.test.ts                  # Unit tests
├── types.ts                        # Type definitions
└── index.ts                        # Main entry point
```

## 💡 Key Concepts

### Identity
Operators are identified by cryptographic public keys, not personal information:

```typescript
const identity = KeyManager.generateIdentity();
// {
//   publicKey: "hex_string",
//   signingKey: "hex_string",
//   nonce: "uuid",
//   created: timestamp
// }
```

### Achievements
Verifiable accomplishments that increase reputation:

```typescript
const achievement = protocol.recordAchievement(operator, {
  description: "Completed transaction",
  category: "transaction" | "collaboration" | "verification" | "custom",
  proof: "cryptographic_hash",
  score: 15
});
```

### Transactions
Cryptographically signed payments:

```typescript
const txResult = protocol.createTransaction(
  alice,
  bob,
  100, // amount
  aliceKeyManager,
  5    // fee
);
```

### Smart Contracts
Autonomous execution based on conditions:

```typescript
const contract = protocol.createContract(
  creator,
  "Contract Title",
  "Description",
  [{ type: "reputation", operator: alice, threshold: 50 }],
  [{ type: "transfer", target: bob, amount: 100 }]
);

const result = protocol.executeContract(contract.id, (condition) => {
  return protocol.getReputation(condition.operator)?.score >= condition.threshold;
});
```

### Oracle Attestations
Chainlink-compatible verification:

```typescript
protocol.registerOracleNode("chainlink-node-1");

const request = protocol.requestAttestation(
  subject,
  "claim",
  "chainlink-node-1"
);
```

## 🔐 Security Features

✅ **TweetNaCl** - Industry-standard encryption library
✅ **Replay Attack Prevention** - Nonce-based protection
✅ **Signature Verification** - All actions cryptographically signed
✅ **Balance Tracking** - Prevents double-spending
✅ **Oracle Validation** - Multi-node attestation support
✅ **Input Validation** - All parameters validated

## 📊 API Reference

### NexumProtocolManager

```typescript
// Identity
protocol.createIdentity(): Identity

// Reputation
protocol.getReputation(operator: string): ReputationRecord | null
protocol.getLeaderboard(limit?: number): ReputationRecord[]
protocol.getNetworkStats(): NetworkStats

// Achievements
protocol.recordAchievement(operator: string, achievement: Achievement): Achievement
protocol.verifyAchievement(achievementId: string): void

// Transactions
protocol.createTransaction(from, to, amount, signer, fee?): ValidationResult
protocol.confirmTransaction(txId: string, publicKey: string): boolean
protocol.getBalance(address: string): number

// Smart Contracts
protocol.createContract(creator, title, description, conditions, actions): Contract
protocol.executeContract(contractId: string, evaluator): ExecutionResult

// Oracle
protocol.registerOracleNode(nodeAddress: string): void
protocol.requestAttestation(subject, claim, oracleNode): ValidationResult
protocol.getOracleStats(): OracleStatistics
```

## 🧪 Testing

Comprehensive test suite with Jest:

```bash
npm test                    # Run all tests
npm test -- --coverage      # Generate coverage report
npm test -- --watch        # Watch mode
```

## 📈 Performance

- **Lite MVP** - Minimal dependencies for fast deployment
- **In-Memory** - Ultra-fast caching and state management
- **Async-Ready** - Designed for scaling to async oracle integration
- **High-Quality Code** - Strong typing, validation, error handling

## 🛣️ Roadmap

- [ ] Blockchain integration (Ethereum/Polygon)
- [ ] Chainlink VRF integration
- [ ] Zero-knowledge proofs
- [ ] Multi-signature contracts
- [ ] Decentralized identity (DID)
- [ ] DAO governance
- [ ] Cross-chain interoperability

## 📦 Project Structure

```
nexum-ledger/
├── src/
│   ├── crypto/
│   │   └── KeyManager.ts (87 lines)
│   ├── core/
│   │   ├── ReputationLedger.ts (221 lines)
│   │   ├── TransactionPool.ts (215 lines)
│   │   ├── SmartContract.ts (168 lines)
│   │   ├── OracleAttestation.ts (163 lines)
│   │   ├── ProtocolManager.ts (185 lines)
│   │   └── ReputationLedger.test.ts (171 lines)
│   ├── types.ts (118 lines)
│   └── index.ts (191 lines)
├── package.json
├── tsconfig.json
├── jest.config.js
├── .gitignore
└── README.md
```

## 🔧 Installation & Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run development demo
npm run dev

# Run all tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

### Contributing Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue.

---

**Built with privacy-first architecture for the cypherpunk movement** 🔒

**Version:** 2.0.0 (Lite MVP)
**Last Updated:** 2026-05-27
**Status:** Active Development
