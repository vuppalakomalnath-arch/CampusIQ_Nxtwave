# 🎓 CampusIQ — RAG-Based Institutional College Chatbot

CampusIQ is an enterprise-grade Retrieval-Augmented Generation (RAG) platform designed for college campuses. It enables students, faculty, and administrators to query institutional documents (admissions, syllabi, fee schedules, exam circulars, hostel rules, placement policies, and department handbooks) and receive 100% grounded, auditable answers with source citations, relevance scoring, voice interaction, and unknown-question handling.

---

## 🌟 Key Features

1. **Strictly Grounded RAG Pipeline**:
   - Ingestion: PDF, DOCX, TXT, and Markdown parsing with automatic OCR fallback (via Tesseract.js) for scanned pages.
   - Text Chunking: Recursive character chunking preserving headings and page metadata.
   - Dense Embeddings: Google Gemini (`text-embedding-004`) / OpenRouter embeddings.
   - Hybrid Search: Vector similarity combined with keyword text search via Reciprocal Rank Fusion.
   - Re-Ranking: Passage relevance scoring and confidence categorization (`High`, `Medium`, `Low`, `Unavailable`).
   - Grounded Answer Generation: Streaming LLM responses strictly derived from retrieved evidence with zero hallucination.

2. **Student & Faculty Experience**:
   - Conversational AI with multi-turn history.
   - Interactive Source Cards displaying cited document titles, department, page numbers, and highlighted passages.
   - Multi-modal Voice Assistant (Speech-to-Text input & Text-to-Speech playback).
   - Instant conversation export (Markdown & JSON formats).
   - Answer feedback controls (👍 / 👎 with reason capture).
   - Dynamic suggested follow-up questions.

3. **Administration & RAG Intelligence**:
   - Multi-step Document Upload & Management.
   - Document Version Control & instant version rollback.
   - Automatic AI Executive Summaries & auto-generated FAQs.
   - Department-wise Knowledge Base collection manager.
   - Analytics Dashboard tracking student queries, retrieval latencies, and knowledge gaps (unanswered/low-confidence questions).
   - System Diagnostics for Vector search, AI providers, and async queue health.

---

## 🏗️ Architecture & Technology Stack

```
CampusIQ/
├── client/                     # Next.js Frontend (Pages Router)
│   ├── src/
│   │   ├── components/         # AppShell, Chat, MessageBubble, SourceCard, VoiceControls, etc.
│   │   ├── pages/              # Pages: /, /login, /register, /dashboard, /chat, /admin, etc.
│   │   ├── services/           # Axios API client, SSE ChatStream, Voice Service
│   │   ├── store/              # Zustand Stores (auth, chat, knowledgeBase)
│   │   └── styles/             # Tailwind CSS & custom design system
│   └── package.json
│
└── server/                     # Node.js + Express Backend API
    ├── src/
    │   ├── ai/                 # OpenRouter, Gemini, Answer/Summary/FAQ generators
    │   ├── config/             # Environment, Database, AI, and Socket.IO configuration
    │   ├── controllers/        # Request handlers & response formatters
    │   ├── middlewares/        # Auth (JWT & Roles), Error handling, Rate limiting
    │   ├── models/             # Mongoose Models (User, KB, Document, Chunk, Message, etc.)
    │   ├── queues/             # BullMQ background document processing queue
    │   ├── rag/                # Parsing, OCR, Chunking, Embedding, Vector Store, Hybrid Retrieval
    │   ├── routes/             # API routes
    │   ├── scripts/            # Database seed script
    │   ├── services/           # Business logic layer
    │   ├── workers/            # BullMQ worker
    │   ├── app.js              # Express app setup
    │   └── server.js           # Server entrypoint
    └── package.json
```

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.
- **Redis (Optional)**: If Redis is running, BullMQ will use it for queueing; if Redis is not present, CampusIQ automatically falls back to asynchronous local background processing.
- **AI Provider API Key**: At least one of **OpenRouter API Key** or **Google Gemini API Key**.

---

### 2. Backend Setup (`server/`)

1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the example:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://127.0.0.1:27017/campusiq
   JWT_SECRET=your_secure_jwt_secret_key_here

   # AI Providers (Set either or both)
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=anthropic/claude-3.5-haiku

   GEMINI_API_KEY=your_google_gemini_api_key
   GEMINI_MODEL=gemini-1.5-flash

   # Embeddings & Vector Search
   EMBEDDING_PROVIDER=gemini
   EMBEDDING_MODEL=text-embedding-004
   VECTOR_INDEX_NAME=college_documents_vector_index

   # Storage & Queue
   REDIS_URL=redis://127.0.0.1:6379
   DOCUMENT_STORAGE_PROVIDER=local
   MAX_UPLOAD_SIZE_MB=20
   ```

5. **Seed the Database** (Initial Admin, Faculty, Student, and 5 College Collections):
   ```bash
   npm run seed
   ```
   *This seeds sample collections (Admissions, Academics, Computer Science, Hostel Life, Placements) and indexes all sample documents into vector chunks.*

6. Start the Backend Server:
   ```bash
   npm run dev
   ```
   The backend API will be running at `http://localhost:5000/api`.

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal and navigate to `client/`:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` configuration file:
   ```bash
   cp .env.example .env.local
   ```
   Ensure it contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. Start the Next.js Development Server:
   ```bash
   npm run dev
   ```
   Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Seed Accounts

You can immediately sign in using any of the seeded accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusiq.edu` | `Password123!` | Full Admin Portal, Document Ingestion, Version Control, Analytics, System Health |
| **Faculty** | `faculty@campusiq.edu` | `Password123!` | Department Knowledge Bases, Document Management, Chatbot |
| **Student** | `student@campusiq.edu` | `Password123!` | Student Dashboard, RAG Chatbot, Voice Assistant, Knowledge Browser |

*(Or register a new account via the `/register` page).*

---

## 🧪 Testing the RAG Chatbot Flow

1. **Login as Student**:
   - Go to [http://localhost:3000/login](http://localhost:3000/login) and click the **Student** quick-fill button.
2. **Ask a Grounded Question**:
   - *"What is the minimum attendance required for final exams?"*
   - Observe the streaming answer, high confidence score, and cited document badge: *`Academic Regulations, Grading Norms & Examination Guidelines (Page 1)`*.
3. **Ask an Unknown Question**:
   - *"What is the recipe for chocolate cake?"*
   - Observe that the system **rejects hallucination** and displays the institutional unavailable message without fabricating sources.
4. **Try Voice Controls**:
   - Click the microphone icon to ask via speech, or the speaker icon to listen to the answer.
5. **Inspect Admin Intelligence**:
   - Sign in as `admin@campusiq.edu`.
   - Upload new college PDFs or notices via `/admin/documents/upload`.
   - Monitor real-time chunking, OCR status, auto-generated executive summaries, and FAQs.

---

## 🌐 Production Deployment Guide

### Step 1: Deploy Backend to Render

1. Push your repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `campusiq-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js` (or `npm start`)
6. Add **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or default)
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random secret*
   - `CLIENT_URL`: *Your Vercel URL, e.g. `https://campusiq.vercel.app`*
   - `GEMINI_API_KEY` (or `OPENROUTER_API_KEY`): *Your API Key*
   - `EMBEDDING_PROVIDER`: `gemini`
   - `VECTOR_INDEX_NAME`: `college_documents_vector_index`
7. Click **Create Web Service**. Once deployed, copy your Render backend URL (e.g. `https://campusiq-api.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel

1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `client`
5. Set **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_API_URL`: `https://campusiq-api.onrender.com/api` *(Your Render backend URL with `/api`)*
   - `NEXT_PUBLIC_SOCKET_URL`: `https://campusiq-api.onrender.com`
6. Click **Deploy**.
7. Once finished, copy your Vercel URL and update `CLIENT_URL` in your Render backend settings so CORS allows requests from your Vercel domain!

---

### Step 3: MongoDB Atlas Vector Search Index (Optional for Atlas Cloud)

In your MongoDB Atlas Dashboard:
1. Go to **Atlas Search** → **Create Search Index** → **JSON Editor**.
2. Select database `campusiq` and collection `documentchunks`.
3. Set index name to `college_documents_vector_index`.
4. Use this index definition:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 768,
         "similarity": "cosine"
       },
       {
         "type": "filter",
         "path": "knowledgeBase"
       },
       {
         "type": "filter",
         "path": "status"
       }
     ]
   }
   ```
*(Note: If vector search index is not created, CampusIQ automatically uses high-performance Cosine similarity filtering).*
