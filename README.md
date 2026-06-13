# 🚀 Secure Online Judge (MERN + Docker + Agentic AI)

A production-grade, high-performance, and secure Online Judge platform built for competitive programming. The system evaluates multi-language user submissions against hidden test suites within a completely sandboxed container environment while delivering context-aware, state-driven Socratic debugging hints via an Agentic AI pipeline.

## 🏗️ High-Level System Architecture

This platform leverages a decoupled, scalable architecture meticulously engineered for isolation, security, and low-latency feedback loop cycles.

* **Frontend:** React.js (Vite) styled with an immersive dark-theme UI, featuring **Monaco Editor** for VS Code-like autocomplete and rich syntax highlighting.
* **Backend:** Node.js + Express.js acting as a high-throughput API gateway and job coordinator managing compilation child processes.
* **Database:** MongoDB Atlas utilizing tailored Mongoose data models for user accounts, global problem sets, and execution state records.
* **Sandbox Engine:** Ephemeral, headless Docker Linux containers orchestrating secure multi-language isolation.
* **AI Engine:** LangChain-managed LLM integration feeding optimized context windows (Failed Source Code + Diff Matching) for non-revealing code mentorship.
* **Security Stack:** Custom JWT (JSON Web Tokens) verification middleware paired with client-side session state persistence and server-side **Bcrypt** cryptographic password salting.

---

## 🔐 Deep-Dive Core Features

### 1. Multi-Language Secure Sandbox
* **Polyglot Runtime Support:** Fully engineered to compile, map execution artifacts, and dynamically run **C, C++, Java, and Python** code.
* **Network Air-gapping:** Spun up using a strict `--network none` configuration flag to comprehensively mitigate malicious remote socket creation or data exfiltration vectors.
* **Resource & Leak Mitigation:** Each execution instance is bounded and auto-pruned using the `--rm` flag. System cleanup runs natively to proactively terminate orphaned zombie containers and mitigate memory leaks on the host server.
* **Whitespace-Insensitive Diff Evaluation:** The engine runs sanitization filters targeting trailing whitespaces, carriage returns (`\r`), and newline mismatches to eliminate format-based evaluation edge cases.

### 2. Socratic Agentic AI Mentor
* **Context Window Integration:** Automatically packages the user's failed code block alongside structural runtime outputs (Actual Output vs. Expected Test Case Output).
* **Prompt Injection Defense:** Hardened using defensive prompt system constraints designed to nullify malicious comment injection strings (e.g., trying to hijack instructions to force full solution output).
* **Socratic Output Constraints:** Strictly acts as an interpretive guide; provides structural logic hints rendered beautifully in native Markdown without ever providing copy-pasteable code solutions.

### 3. High-Performance Global Leaderboard
* **Real-time Metrics Tracking:** Aggregates multi-user profile telemetry using optimized, non-blocking backend database aggregation pipelines. Tracks accepted sub-matrices cleanly across historical performance histories.

---

## 🚀 How to Run Locally

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas Connection String
* Docker Desktop running in the background
* OpenAI API Key (or equivalent LLM access tokens)


### 1. Configure and Run Backend
Create a `.env` file within the `backend/` directory specifying your local execution paths and secret keys:
`PORT=5000`
`MONGO_URI=your_mongodb_atlas_uri`
`JWT_SECRET=your_jwt_signing_key`
`OPENAI_API_KEY=your_llm_api_key`

Then start the server instance:
`cd backend`
`npm install`
`npm run dev`

### 2. Start Frontend Client
`cd ../frontend`
`npm install`
`npm run dev`

---
**Built by VIBHU TOMER**