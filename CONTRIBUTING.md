# Contributing to UNREAD

Thank you for your interest in contributing to UNREAD — The AI Catch-up Engine.

## Local Development Workflow

### Prerequisites
- Node.js 18+ (tested with v20.18 LTS)
- npm 9+

### Setup Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run type-checker
npm run lint

# 4. Run automated test suite
npm run test

# 5. Build for production
npm run build
```

## Architectural Guidelines

1. **Strict Privacy Boundary**: Never import, call, or bundle third-party cloud analytics, telemetry libraries, or cloud AI SDKs (OpenAI, Anthropic, Google Gemini Cloud APIs, etc.). All features must run locally on the client machine.
2. **Deterministic Anchoring**: Date and deadline parsing must be anchored against the message's historical timestamp rather than relying on current machine time.
3. **Traceability**: Every extracted priority, task, decision, deadline, and mention must retain an immutable evidence pointer (`sourceMessageId`) to the original message.
4. **Clean Code & Types**: All TypeScript code must pass `tsc --noEmit` with strict null checks.
