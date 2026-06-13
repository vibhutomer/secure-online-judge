# 🚀 Secure Online Judge (MERN + Docker)

A high-performance, secure Online Judge platform built for competitive programming. This system evaluates user-submitted C++ code against hidden test cases in a secure, containerized execution environment.

## 🏗️ High-Level System Architecture

This project is built using a modern MERN stack with a strong focus on secure remote code execution.

* **Frontend:** React (Vite), Monaco Editor (for VS Code-like syntax highlighting).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (Mongoose).
* **Execution Engine:** Docker (Containerized Linux environment).
* **Security:** JWT (JSON Web Tokens) for route protection, bcrypt.js for password hashing.

## 🔐 Core Features

1. **Secure Authentication:** Complete Login/Signup flow using encrypted JWT sessions. Routes are protected via custom auth middleware.
2. **Dynamic Problem Dashboard:** Problems are fetched from MongoDB, categorized by difficulty, and displayed in a modern React UI.
3. **The Sandbox (Remote Code Execution):** * When a user submits code, the Node.js backend spins up an isolated **Docker** container.
   * The container executes the C++ code against hidden `.txt` inputs.
   * The container is strictly cut off from internet access (`--network none`) to prevent malicious network calls.
   * The container is immediately destroyed (`--rm`) after execution to preserve system memory.
4. **Strict Evaluation:** The engine automatically trims trailing whitespaces and carriage returns to ensure highly accurate "Accepted" or "Wrong Answer" verdicts.

## 🚀 How to Run Locally

### Prerequisites
* Node.js installed
* MongoDB Atlas connection string
* Docker Desktop installed and running

### 1. Start the Backend
\`\`\`bash
cd backend
npm install
# Create a .env file with PORT, MONGO_URI, and JWT_SECRET
npm run dev
\`\`\`

### 2. Start the Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

---
*Built by Vibhu Tomer*