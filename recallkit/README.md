# RecallKit — AI-Powered Active Recall Study Assistant

> A full-stack, reliable learning platform that converts free-form study notes into interactive flashcards and multiple-choice quizzes using Groq-hosted LLMs, runtime Zod validation, and React.

---

## 1. Project Overview

**RecallKit** is an AI-powered study assistant built around cognitive science principles—specifically **active recall** and **spaced repetition**. Unlike generic conversational chatbots, RecallKit is a structured learning engine:

- Users provide unstructured study notes or textbook chapters.
- The backend securely instructs **Groq** models to generate structured learning materials rather than chat responses.
- AI responses pass through an automated parsing, schema validation, and single-attempt repair pipeline before reaching the frontend.
- React components render validated data into interactive 3D-flipping flashcards and multiple-choice quizzes with instant feedback, explanations, and verbatim source citations.
- Learners can review mistakes and retest only incorrect answers client-side with zero unnecessary API calls.

---

## 2. Main Features

- **Structured AI Generation**: Converts raw notes into titles, executive summaries, flashcards, and multiple-choice questions (MCQs).
- **Interactive 3D Flashcards**: Flip cards to reveal answers and grounded source citations; categorize into *"Mastered"* vs *"Needs Review"*; drill cards in a dedicated review deck.
- **Multiple-Choice Quiz Engine**: 4 options per question (`A`, `B`, `C`, `D`), instant feedback on submission, detailed explanations, and source citations.
- **Client-Side Retest Engine**: Isolate and retest only previously missed questions without repeating Groq API calls.
- **Multi-Stage Validation Pipeline**: Zod schemas enforce exactly 4 options, unique option IDs, correct answer matching, and source grounding.
- **Automated Self-Repair Mechanism**: If Groq produces an invalid schema, the server sends back exact errors for a single targeted repair attempt.
- **Stale-Request & Race Condition Guards**: `AbortController` and `useRef` request tracking ensure older in-flight requests never overwrite newer responses.
- **Session Persistence**: Saves notes and generated sessions to LocalStorage with schema verification on reload.
- **Enterprise Security**: Server-only API key isolation, `helmet` security headers, CORS origin whitelisting, and a 15 req/min rate limiter.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js (v22), Express, TypeScript, `tsx` |
| **AI Provider** | Groq API with configurable model (`GROQ_MODEL`) |
| **Validation** | Zod (v4) runtime schema validation |
| **Security & Utilities** | Helmet, CORS, Express Rate Limit, UUID |
| **Testing** | Vitest, React Testing Library, Supertest, JSDOM |
| **Deployment Targets** | Frontend on Vercel, Backend on Render |

---

## 4. Architecture

```
User Input (Notes, Mode, Difficulty)
        │
        ▼
React Frontend (Vite + Tailwind)
        │  HTTP POST /api/study/generate (with AbortController)
        ▼
Express Backend API (CORS, Helmet, Rate Limiter, Timeout)
        │
        ▼
studyGenerator Orchestrator
        │
        ▼
groqService (Groq Chat Completions API, JSON mode)
        │
        ▼
responseParser (Strips fences, handles malformed syntax)
        │
        ▼
responseValidator (Zod Schema Validation & Grounding Check)
        │
        ├──▶ [INVALID] ──▶ Single Repair Attempt ──▶ Re-parse & Validate
        │                                                  │
        │                                       [FAILED AGAIN] ──▶ Controlled 502 AppError
        ▼ [VALID]
enrichWithApplicationIds (UUID assignment for Set, Cards, Questions)
        │
        ▼
React Client Rendering (FlashcardViewer & QuizEngine)
        │
        ├──▶ LocalStorage Session Persistence
        └──▶ Client-Side Mistake Retesting (0 API calls)
```

---

## 5. Folder Structure

```
recallkit/
├── client/                     # Frontend React + TypeScript application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Card, LoadingSpinner, ErrorDisplay, EmptyState
│   │   │   ├── input/          # NoteEditor, ModeSelector, DifficultySelector
│   │   │   ├── flashcards/     # FlashcardCard (3D flip), FlashcardViewer
│   │   │   ├── quiz/           # QuizOption, QuizQuestionCard, QuizEngine, QuizResults
│   │   │   └── layout/         # Navbar, Layout
│   │   ├── hooks/              # useFlashcards, useQuiz, useStudyGenerator, useSessionStorage
│   │   ├── pages/              # HomePage, StudyPage
│   │   ├── services/           # api.ts (fetch client)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind CSS & 3D card styling
│   ├── index.html
│   ├── vercel.json             # Vercel SPA routing
│   ├── vite.config.ts
│   └── package.json
├── server/                     # Backend Express API
│   ├── src/
│   │   ├── controllers/        # studyController.ts
│   │   ├── middleware/         # rateLimiter.ts, timeout.ts
│   │   ├── prompts/            # studyPrompt.ts (Prompt builder & repair builder)
│   │   ├── routes/             # studyRoutes.ts
│   │   ├── services/           # groqService.ts, responseParser.ts, responseValidator.ts, studyGenerator.ts
│   │   ├── utils/              # AppError.ts
│   │   └── index.ts            # Server entry point
│   ├── .env                    # Server secrets (gitignored)
│   ├── tsconfig.json
│   └── package.json
├── shared/                     # Shared between Client and Server
│   ├── studySchema.ts          # Zod validation schemas
│   └── types.ts                # TypeScript data interfaces
├── tests/                      # Automated Vitest test suites (75 tests)
│   ├── api.test.ts             # Supertest Express endpoint tests
│   ├── failureSimulation.test.ts # 9 AI failure catalog tests
│   ├── flashcardsAndQuiz.test.ts # Flashcards and Quiz engine logic tests
│   ├── geminiPrompt.test.ts    # Prompt engineering & mock tests
│   ├── pipeline.test.ts        # Parsing, validation & repair loop tests
│   ├── schema.test.ts          # Zod contract validation tests
│   ├── staleRequest.test.ts    # Stale request & race condition tests
│   └── stateAndPersistence.test.ts # Retest isolation & LocalStorage tests
├── .env.example                # Example environment variables
├── .gitignore
├── vitest.config.ts            # Test runner config
├── package.json                # Monorepo scripts
└── README.md
```

---

## 6. Installation Instructions

### Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+
- A Groq API key ([Create one in Groq Cloud](https://console.groq.com/keys))

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-username/recallkit.git
cd recallkit

# Install dependencies across all workspaces
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

---

## 7. Environment Variables

Create `server/.env` based on `.env.example`:

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```env
# Required: Groq API key from https://console.groq.com/keys
# Set to 'mock' for local offline testing without an active API key
GROQ_API_KEY=your_actual_groq_api_key_here

# Optional: choose a Groq model (defaults to llama-3.3-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile

# Server Port (optional, defaults to 3001)
PORT=3001

# Client URL for CORS (optional, defaults to http://localhost:5173)
CLIENT_URL=http://localhost:5173
```

> **Security Note:** The Groq API key is stored strictly on the server and is **never** sent to or bundled with the client.

---

## 8. Running Instructions

### Development Mode (Both Frontend & Backend concurrently)

```bash
# From the root directory:
npm run dev
```

This starts:
- Frontend on [http://localhost:5173](http://localhost:5173)
- Backend API on [http://localhost:3001](http://localhost:3001)
- Health check on [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Production Build

```bash
# Build client and server
npm run build
cd server && npm run build
```

---

## 9. AI Integration Explanation

RecallKit connects to Groq-hosted LLMs using the OpenAI-compatible chat completions API with a configurable `GROQ_MODEL`.

1. **System Instructions & Grounding**:
   The prompt enforces strict instructional design rules:
   - Generate conceptually deep flashcards and 4-option multiple-choice questions.
   - For every card and question, the AI must provide a `sourceExcerpt` quoting directly from the user's notes.
2. **Deterministic Output (`temperature: 0.2`)**:
   Keeps AI output factual and reduces hallucinations.
3. **Structured Response Format**:
   Uses JSON-mode responses combined with explicit JSON schema prompts to mandate pure JSON without conversational filler.

---

## 10. JSON Validation and Failure Handling

AI output is inherently unpredictable. RecallKit protects application stability through a multi-layer defense:

```
Raw Response ──▶ Parser ──▶ Zod Schema ──▶ Excerpt Grounding ──▶ App ID Assignment
```

- **Markdown Fence Stripping**: Automatically cleans ` ```json ... ``` ` wrappers.
- **Structural Validation (`shared/studySchema.ts`)**:
  - Enforces non-empty strings for titles, fronts, backs, explanations, and excerpts.
  - Ensures exactly 4 quiz options per question.
  - Ensures option IDs are unique (`A`, `B`, `C`, `D`).
  - Ensures `correctOptionId` strictly matches one of the 4 options.
- **Single-Attempt Repair Mechanism (`studyGenerator.ts`)**:
  If validation fails, the server sends the exact validation errors back to Groq in a targeted repair prompt. If the second attempt fails, a safe `INVALID_AI_OUTPUT` error is returned.
- **Never Render Unvalidated AI Output**: Only data that passes all checks and receives backend UUIDs reaches React components.

---

## 11. Testing Instructions

RecallKit features comprehensive automated tests covering schema contracts, API endpoints, failure scenarios, stale requests, and state persistence.

```bash
# Run all automated unit and integration tests:
npm test
```

### Test Coverage Highlights:
- **`tests/schema.test.ts`**: Zod validation contracts (4 options, uniqueness, bounds).
- **`tests/pipeline.test.ts`**: Parser, validator, grounding checks, and repair loop.
- **`tests/failureSimulation.test.ts`**: Simulation of failure scenarios.
- **`tests/api.test.ts`**: Supertest Express API endpoint testing, rate limiting, and 400/502 handling.
- **`tests/groqPrompt.test.ts`**: Prompt builder and mock fallback testing.
- **`tests/flashcardsAndQuiz.test.ts`**: Interactive flashcard flip and quiz scoring.
- **`tests/stateAndPersistence.test.ts`**: Zero-API-call mistake retesting and LocalStorage recovery.
- **`tests/staleRequest.test.ts`**: Race condition protection via `AbortController` and `useRef`.

---

## 12. AI Usage Disclosure

This project uses Groq-hosted large language models to generate structured study materials. The model output is validated server-side before it is rendered to users.

---

## 13. Known Limitations

- **Groq Rate Limits**: API quota and concurrency limits vary by plan. A rate limiter on the backend protects against spikes.
- **Text Length**: Notes are capped at 20,000 characters to ensure responses fit comfortably within model output limits.
- **Language**: Optimized primarily for English text; non-Latin alphabets may require specialized prompt adjustments.

---

## 14. Actual Time Spent

- **Architecture, Setup & Monorepo Configuration (Task 1)**: ~45 mins
- **Zod Data Contracts & Schema Verification (Task 2)**: ~30 mins
- **Groq Integration & Prompt Engineering (Task 3)**: ~40 mins
- **Parsing, Validation Pipeline & Repair Mechanism (Task 4)**: ~55 mins
- **Express Backend API & Middleware (Task 5)**: ~35 mins
- **React Frontend UI & Tailwind Styling (Task 6)**: ~50 mins
- **Interactive Flashcards & Quiz Engine (Task 7)**: ~45 mins
- **Results, Retest & State Management (Task 8)**: ~40 mins
- **Failure Simulations & Stale-Request Tests (Task 9)**: ~45 mins
- **Security Audit, Documentation & Deployment Config (Task 10)**: ~35 mins
- **Total Engineering Time**: **~7 hours**

---

## 15. Deployment Guide

### Frontend Deployment (Vercel)
1. Push this repository to GitHub.
2. In Vercel, select **Import Project** and point to the repository.
3. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy.

### Backend Deployment (Render)
1. In Render, select **New Web Service** and connect the repository.
2. Configure settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key.
   - `GROQ_MODEL`: Your preferred Groq model (for example `llama-3.3-70b-versatile`).
   - `CLIENT_URL`: The deployed Vercel frontend URL.
4. Deploy.
