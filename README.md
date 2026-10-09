# UNREAD — The AI Catch-Up Engine

> **“Catch up on what matters. Skip what doesn't.”**

UNREAD is a high-performance, **100% on-device conversation intelligence engine** engineered for the challenge: *“The Unread Problem — What Did I Miss?”*.

Turn hundreds of unread chat messages into an actionable, executive-level briefing with clear priorities, tasks, imminent deadlines, personal mentions, and team decisions — **all without a single byte of your conversations leaving your device.**

---

## 🌟 Key Product Capabilities

### 1. Executive Catch-up Briefing & Topics
- Generates a synthesized narrative overview answering **“What happened?”**.
- Automatically groups discussions into thematic clusters (*Architecture & Data, UI & UX, DevOps, Deadlines*).
- Provides chronological progression and change deltas when new messages arrive.

### 2. Explainable Urgency & Priority Scoring
- Transparent priority ranking (0–100 score) across three clear tiers: **Urgent**, **Important**, and **Informational**.
- Context-aware weighting: Evaluates imminent deadlines (< 36 hours), direct user assignments, and urgency cues while discounting casual banter (e.g. *"no rush"*, *"take your time"*).
- Every prioritized item explicitly explains **why** it was prioritized.

### 3. Action Items & Ownership Extraction
- Identifies tasks, assignments, and due dates.
- Detects whether tasks belong to **you** (using your display name and aliases) or teammates.
- Distinguishes **pending**, **completed**, and **uncertain** items without fabricating ownership.

### 4. Deterministic Temporal Deadlines & Commitments
- Anchors relative date expressions (*"by tomorrow 5pm"*, *"today at 6:00 PM"*, *"by EOD"*) directly to message timestamps.
- Flags imminent deadlines with countdown urgency.
- Marks ambiguous dates (*"sometime next week"*) as flexible/uncertain.

### 5. Personal Mention & Direct Request Tracking
- Matches exact names and configured aliases (e.g., `Alex`, `Aditya`, `@akg`).
- Differentiates direct action requests (*"Alex please review PR #4"*) from contextual name drops.

### 6. Team Decision vs. Proposal Separation
- Records confirmed consensus (*"Agreed: We're locking in indigo accents"*) with participant attribution.
- Distinguishes confirmed decisions from preliminary proposals (*"Should we..."*).

### 7. Unanswered Question Resolution
- Detects questions and tracks conversational replies across participants.
- Surfaces unresolved questions requiring follow-up while marking answered questions as resolved.

### 8. Full Source Traceability & Explorer
- **Zero Hallucination Tolerance:** Every extracted task, deadline, mention, and decision links directly to its source message ID.
- One-click **"Source"** button smoothly scrolls to and pulses the exact cited message in the chat timeline.

---

## 🛡️ Non-Negotiable Privacy Architecture

UNREAD treats privacy as an architectural constraint, not a marketing promise:

```mermaid
flowchart TD
    subgraph Browser Client [Local Browser Environment (On-Device)]
        A[Chat Export File / Plaintext Paste] --> B[Input Sanitizer & Bounds Validator]
        B --> C[Multi-Format Chat Parser]
        C --> D[Deterministic NLP Engine]
        
        subgraph NLP Pipeline [Pure Local Processing]
            D --> D1[Temporal Date Resolver]
            D --> D2[Task & Assignment Extractor]
            D --> D3[Mention & Alias Detector]
            D --> D4[Decision & Consensus Engine]
            D --> D5[Question Resolution Tracker]
            D --> D6[Explainable Urgency Scorer]
        end
        
        D1 & D2 & D3 & D4 & D5 & D6 --> E[Structured Insights & Evidence Map]
        E --> F[IndexedDB Local Storage]
        E --> G[Interactive UI: Dashboard, Action Center, Explorer]
    end

    subgraph External [External World]
        H[Cloud AI APIs]
        I[Remote Telemetry / Analytics]
    end

    G -.->|BLOCKED BY CSP: 0 Bytes Outbound| H
    G -.->|BLOCKED BY CSP: Zero Trackers| I
```

- **Zero Cloud AI Calls:** Operates without external API keys or cloud AI services.
- **Client-Side Storage:** Data is persisted in your browser's IndexedDB (`unread_catchup_db`).
- **No Telemetry or Pixels:** Zero tracking scripts, cookies, or remote logging.
- **Strict Content Security Policy (CSP):** Prohibits external network communication outside of `'self'`.
- **Data Governance:** One-click export to sanitized Markdown (`.md`) or JSON (`.json`), plus single-chat and complete local data purge controls.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node.js v20.18.0 LTS)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Run Automated Tests
```bash
npm run test
```
Executes all 20 Vitest automated tests covering parsers, date math, NLP extractors, UI components, and end-to-end integration flows.

### 4. Run TypeScript Check & Lint
```bash
npm run lint
```

### 5. Production Build
```bash
npm run build
```

---

## 💻 Supported Conversation Formats

UNREAD includes a multi-format, streaming parser capable of ingesting:

1. **Standard Bracketed Logs:**
   ```text
   [2026-10-09 09:15:20] Alice: Hey @Alex, please check the build
   [2026-10-09 09:16:00] Bob: We decided to deploy at 5pm
   ```
2. **WhatsApp Style Exports:**
   ```text
   10/09/2026, 09:15 - Alice: Morning team!
   10/09/2026, 09:16 - Marcus: Infra is verified offline.
   ```
3. **Slack / IRC / Timestamped Plaintext:**
   ```text
   2026-10-09 09:15:20 Alice: Morning team
   ```
4. **Structured JSON Exports:**
   ```json
   [
     { "sender": "Alice", "timestamp": "2026-10-09T09:15:20Z", "text": "Task description" }
   ]
   ```
5. **Multiline Message Support:** Code snippets, multiline bullet points, and multi-paragraph statements are automatically associated with the originating message.

---

## 🎮 Demonstration Mode

To immediately evaluate UNREAD without uploading private files:
1. Open the application.
2. Click **"Load Demo Conversation (Hackathon Sprint)"**.
3. UNREAD instantly populates a realistic 25-message fictional hackathon team sync featuring:
   - **Imminent Deadline:** Submission deadline at 6:00 PM today.
   - **Direct User Request:** Sarah requesting Alex to verify parsers before 2:00 PM.
   - **Confirmed Decision:** Consensus reached on local-first privacy and indigo aesthetic.
   - **Completed Work:** Priya confirming database migration PR and tests pass.
   - **Unanswered Question:** Marcus asking about Firefox Web Worker memory footprint.
   - **Casual Banter Filter:** David announcing pizza arrival with *"no rush"*, correctly classified as informational rather than false-alarm urgent.

---

## 📁 Repository Architecture

```text
Hackathon1/
├── src/
│   ├── components/            # Linear/Raycast-inspired dark UI components
│   │   ├── ActionCenter.tsx   # Prioritized actionable inbox with filters
│   │   ├── Dashboard.tsx      # Executive briefing, KPI badges, top priorities
│   │   ├── Header.tsx         # Navigation, conversation selector, badges
│   │   ├── ImportModal.tsx    # Drag-and-drop, format validation, pre-import preview
│   │   ├── MessageExplorer.tsx# Searchable timeline with source pulse highlighting
│   │   ├── PrivacyCenter.tsx  # On-device boundary audits, storage meters, data export
│   │   ├── SettingsModal.tsx  # User name and alias configuration
│   │   └── WelcomeModal.tsx   # First-time onboarding and privacy pledge
│   ├── data/
│   │   └── sampleConversation.ts # Realistic hackathon sync dataset
│   ├── lib/
│   │   ├── nlp/               # Modular local NLP pipeline
│   │   │   ├── analyzer.ts    # Master analysis orchestrator
│   │   │   ├── dateResolver.ts# Timestamp-anchored temporal date resolver
│   │   │   ├── deadlineExtractor.ts # Deadline commitments & urgency
│   │   │   ├── decisionExtractor.ts # Confirmed decisions vs. proposals
│   │   │   ├── localModelAdapter.ts # Isolated local inference probe (localhost only)
│   │   │   ├── mentionExtractor.ts  # Exact name, alias, and direct request detector
│   │   │   ├── questionResolver.ts  # Conversational answer resolution tracker
│   │   │   ├── summarizer.ts  # Executive summary & thematic clustering
│   │   │   └── urgencyScorer.ts     # Explainable 0-100 priority scoring
│   │   ├── parser/
│   │   │   └── chatParser.ts  # Multi-format parser with multiline support
│   │   ├── security/
│   │   │   └── sanitizer.ts   # XSS sanitization, bounds checking, memory guards
│   │   └── storage/
│   │       └── indexedDB.ts   # Local IndexedDB persistence with memory fallback
│   ├── test/                  # Comprehensive automated test suite (Vitest)
│   │   ├── components.test.tsx# UI component rendering tests
│   │   ├── integration.test.ts# Full sample conversation analysis test
│   │   ├── nlp.test.ts        # Extractors, date math, scoring, and security tests
│   │   ├── parser.test.ts     # Multi-format chat parser tests
│   │   └── setup.ts           # Vitest environment setup
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces and data models
│   ├── App.tsx                # Main application coordinator
│   ├── index.css              # Custom styling, scrollbars, and animations
│   └── main.tsx               # Application entry point
├── .github/workflows/ci.yml   # Automated CI workflow
├── SECURITY.md                # Security policy, threat model, and CSP
├── CONTRIBUTING.md            # Local development guidelines
├── LICENSE                    # MIT License
├── package.json               # Dependencies and scripts
└── vite.config.ts             # Vite & Vitest configuration
```

---

## 🔒 Security & Quality Assurance Checklist

- [x] **Zero Cloud AI Leakage:** Strictly on-device processing.
- [x] **Zero Hardcoded Secrets:** No tokens, API keys, or credentials.
- [x] **Automated Tests:** 20/20 passing tests across 4 test suites.
- [x] **Strict TypeScript:** `tsc --noEmit` cleanly passes with zero warnings.
- [x] **Production Bundle:** Minified production build builds in ~5s.
- [x] **XSS Safe:** Input sanitization and safe DOM text nodes.
- [x] **Memory Bounds:** Enforced 10MB file limit and 15,000 message ceiling.
- [x] **Traceability:** Every finding links to its original message.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
