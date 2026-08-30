# Palm Pay — Backend Service

Node.js (v22.x) + Express + MongoDB service handling authentication, transaction ledgers, atomic balance management, and biometric verification orchestration.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Test Suite
```bash
npm test
```

## 🔐 Key Architectural Patterns
- **Atomic Balance Updates**: `walletService.js` prevents double-spend race conditions via `{ walletBalance: { $gte: amount } }` atomic queries.
- **Biometric Gateway**: `services/mlService.js` routes all computer vision inference with timeout aborts and error translation.
- **Centralized Error Handling**: `utils/AppError.js` and `middleware/errorHandler.js` enforce consistent JSON shapes across all endpoints.
- **Security & Throttling**: Protected with `helmet`, `express-rate-limit`, and `express-validator`.
