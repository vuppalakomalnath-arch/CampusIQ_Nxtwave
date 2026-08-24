# Project Overview & Tech Stack

## Project Overview

Build a full-stack **RAG-Based College Chatbot** called **CampusIQ** that lets students, faculty, and administrators ask college-related questions and receive grounded AI-generated answers based on an institution-managed knowledge base.

The platform must ingest college PDFs, notices, circulars, FAQs, academic calendars, policies, department documents, and other approved resources; extract and process their content; generate embeddings; store searchable vector representations; retrieve the most relevant evidence for every question; and generate answers only from retrieved context. Every answer must display its supporting source, relevance/confidence information, and clear unavailable-information handling when the knowledge base does not contain sufficient evidence.

The platform must support multiple document collections and department-wise knowledge bases, document version management, hybrid keyword + semantic search, document re-ranking, OCR for scanned documents, multilingual questions and answers, voice interaction, streaming responses, chat history, answer feedback, suggested questions, conversation export, AI-generated FAQs, document summarization, role-based access, and admin analytics.

## Tech Stack

- **Frontend:** Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, Socket.IO client, react-dropzone, react-markdown, and lucide-react icons.
- **Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, BullMQ on Redis (via ioredis), Socket.IO, Multer, helmet, morgan, compression, express-validator, bcryptjs, and express-rate-limit.
- **RAG / AI Layer:** LangChain, LangChain text splitters, OpenRouter API as the primary LLM provider, Google Generative AI SDK as fallback, OpenAI-compatible embeddings through configured providers, hybrid retrieval, and document re-ranking.
- **Vector Database:** MongoDB Atlas Vector Search using the same MongoDB deployment as the primary application database.
- **Document Processing:** PDF extraction, DOCX/TXT parsing, OCR for scanned documents, metadata extraction, recursive text chunking, document summarization, and embedding generation.
- **Voice & Multilingual:** Browser speech recognition and speech synthesis on the client, with backend language detection/translation support where required.
- **Storage:** MongoDB metadata plus object/file storage for original uploaded documents. The storage provider must be abstracted behind a document storage service.

## Core Product Requirement

The application is a real Retrieval-Augmented Generation system. The required pipeline is:

**College Documents → Text Extraction → OCR when required → Cleaning → Chunking → Embeddings → Vector Database → Hybrid Search → Re-ranking → Relevant Context → LLM → Grounded Answer + Sources**

A direct LLM response without retrieval must not be presented as a knowledge-base answer.

# Authentication, Knowledge Bases, and RAG Pipeline

## Authentication

The authentication system must support registration, login, JWT-based session handling, protected routes, an `/auth/me` profile endpoint, persistent login state through Zustand, password hashing with bcrypt at cost factor 12, and role separation.

The initial roles are:

1. **Student**
2. **Faculty**
3. **Admin**

Students can use the chatbot and manage their own conversations. Faculty can access permitted department collections. Admins can manage all knowledge bases, documents, versions, users, analytics, and chatbot configuration.

## Knowledge Base Management

The platform must support:

- Multiple document collections.
- Global college knowledge bases.
- Department-wise knowledge bases.
- Collection visibility rules.
- Active/inactive collections.
- Collection descriptions and metadata.
- Department ownership and access control.
- Document counts and processing statistics.
- Default knowledge bases for student queries.

Examples include:

- Admissions
- Academics
- Examination Cell
- Computer Science
- Library
- Hostel
- Placements
- Scholarships
- Student Clubs
- Policies
- Events

A query must search only the collections that the user is authorized to access and that are relevant to the selected chatbot scope.

## Document Ingestion Pipeline

When an admin uploads a document, the backend must process it asynchronously:

1. Validate file type and size.
2. Store the original file.
3. Create a Document record with status `UPLOADED`.
4. Extract text from the document.
5. Run OCR when the document is scanned or text extraction is insufficient.
6. Normalize and clean extracted text.
7. Generate document metadata and an optional summary.
8. Split the content into chunks.
9. Generate embeddings for every chunk.
10. Store chunk text, metadata, embeddings, and source location information.
11. Mark the document version `READY` when processing succeeds.
12. Mark it `FAILED` with a clear error when processing fails.

Every chunk must preserve enough source metadata to support answer citations, including:

- document ID
- document name
- version number
- collection
- department
- page number when available
- chunk index
- source URL or storage reference when available

## RAG Query Pipeline

For every user question, the backend must execute this pipeline:

1. Validate authentication and role access.
2. Load recent conversation context.
3. Detect or resolve the query language.
4. Determine selected knowledge bases.
5. Generate a query embedding.
6. Run semantic vector search.
7. Run keyword search.
8. Merge hybrid retrieval results.
9. Apply metadata and role-based filters.
10. Re-rank the strongest candidates.
11. Calculate retrieval relevance/confidence.
12. Reject insufficient context when evidence is below the configured threshold.
13. Build a grounded prompt containing only approved retrieved context.
14. Stream the LLM answer.
15. Persist the answer, sources, relevance score, and model metadata.
16. Return the final answer with source references and feedback controls.

The answer prompt must explicitly instruct the LLM:

- Answer from the supplied context.
- Do not invent college facts.
- Do not claim unavailable information exists.
- Clearly say when the available documents do not contain the answer.
- Prefer concise answers unless the question requires detail.
- Preserve important dates, fees, department names, eligibility requirements, and policy details exactly as supported by context.

# Document Processing, Retrieval, and AI Layer

## Document Processing

The backend must support at minimum:

- PDF
- DOCX
- TXT
- Markdown

The architecture must allow additional document loaders later.

For scanned or image-based PDFs, the system must attempt OCR before declaring the document unreadable. The admin must see the processing state, OCR status, extracted text size, chunk count, and failure reason.

## Chunking

Documents must use configurable recursive chunking. The chunking service must support:

- chunk size
- chunk overlap
- separator strategy
- document/page metadata
- heading preservation when possible

Chunks must not be created as opaque strings without metadata.

## Embeddings and Vector Search

Each searchable chunk must have an embedding generated through a centralized embedding service.

The vector search layer must:

- Create query embeddings.
- Search MongoDB Atlas Vector Search.
- Filter by collection, department, active document status, and user access.
- Return similarity scores.
- Support top-k configuration.
- Gracefully report unavailable vector search configuration.

The embedding provider must be configurable through environment variables. Controllers and models must never call an embedding provider directly.

## Hybrid Search and Re-Ranking

Retrieval must combine:

1. Semantic/vector search.
2. Keyword/text search.

The system must merge and normalize results, remove duplicates, and optionally apply a re-ranking stage before context construction.

The response must expose:

- retrieval method
- number of retrieved candidates
- number of selected context chunks
- top relevance score
- confidence category

Suggested confidence categories:

- **High** – strong and consistent retrieved evidence.
- **Medium** – relevant evidence exists but may be incomplete.
- **Low** – weak or limited evidence.
- **Unavailable** – no sufficient evidence.

The confidence score must describe retrieval relevance, not falsely claim model certainty.

## Unknown Question Handling

If relevant context cannot be found, the chatbot must not hallucinate an answer.

It must return a clear response such as:

> “I couldn’t find reliable information about that in the available college knowledge base.”

The system may then:

- suggest related questions
- recommend another department collection
- encourage the user to contact the relevant college office
- record the query as an analytics event

The unavailable answer must not contain fabricated sources.

## AI Answer Generation

The answer generation service must:

- Use OpenRouter when `OPENROUTER_API_KEY` is configured.
- Fall back to Google Gemini when `GEMINI_API_KEY` is configured.
- Support streaming output.
- Receive retrieved context from the retrieval service.
- Never retrieve documents directly.
- Return answer text, source IDs, retrieval metadata, and generation metadata.

If no AI provider is configured, the system must fail clearly in development and must not silently pretend to have generated an answer.

# Conversations, Sources, and Student Experience

## Chat Interface

Students must be able to:

- Ask questions in natural language.
- Select a knowledge base or department.
- View streaming responses.
- View answer sources.
- Open source details.
- See highlighted source passages.
- Start a new conversation.
- Continue previous conversations.
- Search or revisit conversation history.
- Export a conversation.
- Give answer feedback.
- Use suggested questions.
- Use voice input.
- Listen to responses.

## Conversation Context

Each conversation stores its user, title, selected collection scope, messages, timestamps, and export metadata.

Recent messages may be supplied to the RAG pipeline for conversational continuity, but previous assistant answers must never become authoritative knowledge-base evidence unless independently supported by retrieved documents.

## Source and Reference Display

Every grounded answer must display the source document(s) used.

Each source reference should contain:

- document title
- collection or department
- version
- page number when available
- relevance score
- short source snippet

When supported by the document format, the UI must highlight the passage or page from which the answer was derived.

## Suggested Questions

The system must support:

- manually configured questions per collection
- context-based related questions
- AI-generated suggested questions

Suggested questions must be clearly separate from verified source content.

## Feedback

Every assistant answer must have:

- 👍 Helpful
- 👎 Not Helpful

The feedback system may optionally capture a reason and must store the related message, user, conversation, and answer metadata for analytics.

## Conversation Export

Users must be able to export a conversation in at least one human-readable format. The export must contain:

- conversation title
- timestamps
- user questions
- assistant answers
- cited sources

# Frontend Pages

The application uses the Next.js Pages Router. The root `/` page redirects authenticated users to the dashboard and unauthenticated users to login.

- `/` – Landing page introducing the College AI Assistant, supported capabilities, example questions, and CTA buttons.
- `/login` – Email/password authentication with validation, JWT handling, Zustand persistence, loading states, and errors.
- `/register` – Student/faculty registration with password validation and session persistence.
- `/dashboard` – Main student dashboard with welcome section, quick actions, recent conversations, selected knowledge base, suggested questions, and knowledge base status.
- `/chat` – Primary RAG chat interface with streaming answers, source cards, confidence indicators, feedback, voice controls, and suggested questions.
- `/chat/[id]` – Existing conversation with full history and source references.
- `/knowledge-bases` – Available collections and department knowledge bases visible to the current user.
- `/admin` – Admin overview with knowledge base metrics, processing status, recent feedback, unanswered questions, and analytics.
- `/admin/documents` – Document list with search, filters, processing state, collection, department, and version details.
- `/admin/documents/upload` – Multi-step document upload and collection assignment.
- `/admin/documents/[id]` – Document detail, extracted content, chunks, versions, processing history, and management actions.
- `/admin/knowledge-bases` – Create, update, activate, deactivate, and manage collections.
- `/admin/analytics` – Chat, retrieval, feedback, unanswered question, document, and collection analytics.
- `/admin/settings` – AI provider, embedding health, retrieval configuration, storage status, and security configuration health.
- `/settings` – User profile, language preferences, theme, voice preferences, and conversation settings.

# Backend Architecture & Database Collections

## Backend Architecture

- **Routes:** Handles HTTP routing, request validation, authorization middleware, and error middleware.
- **Controllers:** Parses requests and shapes responses only.
- **Services:** Own business logic.
- **RAG Layer:** Owns ingestion, chunking, embeddings, retrieval, hybrid search, re-ranking, context building, and answer generation.
- **Document Layer:** Owns file storage, parsers, OCR, document versions, and processing status.
- **AI Layer:** Owns provider selection and streaming.
- **Queues Layer:** Owns asynchronous document processing and retry behavior.
- **Analytics Layer:** Aggregates chat and RAG events.
- **Config Layer:** Centralizes environment variables, MongoDB connection, provider configuration, queue configuration, and Socket.IO setup.

Controllers must never:

- query MongoDB directly
- generate embeddings directly
- call LLM providers directly
- process files directly
- execute vector search directly

## Database Collections

### Users

Stores:

- name
- email
- password with `select: false`
- role: `student | faculty | admin`
- department
- preferred language
- voice preferences
- lastLogin

### KnowledgeBases

Stores:

- name
- description
- slug
- type: `global | department`
- department
- allowed roles
- status: `active | inactive | archived`
- document count
- createdBy

### Documents

Stores:

- title
- original filename
- storage location
- MIME type
- knowledgeBase
- department
- status: `UPLOADED | PROCESSING | READY | FAILED | ARCHIVED`
- current version
- OCR status
- extracted text metadata
- summary
- createdBy
- timestamps

### DocumentVersions

Stores immutable document versions:

- document ID
- version number
- storage location
- content hash
- extracted text metadata
- processing status
- chunk count
- processing error
- createdAt

Deleting a document must not silently destroy historical audit information required by active conversations or analytics.

### DocumentChunks

Stores:

- document ID
- version ID
- knowledge base ID
- text
- embedding
- page number
- chunk index
- heading
- metadata
- vector search fields

### Conversations

Stores:

- user ID
- title
- selected knowledge bases
- language
- createdAt
- updatedAt

### Messages

Stores:

- conversation ID
- role: `user | assistant`
- content
- answer status
- source references
- retrieval metadata
- confidence score/category
- provider metadata
- timestamps

### Feedback

Stores:

- user ID
- conversation ID
- message ID
- rating: `helpful | not_helpful`
- optional reason
- retrieval metadata snapshot

### QueryAnalytics

Stores:

- normalized query
- knowledge bases searched
- retrieval latency
- generation latency
- candidate count
- selected chunk count
- top relevance score
- confidence category
- answer status
- feedback summary

### ProcessingJobs

Stores or mirrors:

- document ID
- version ID
- job status
- retry count
- stage
- error
- timestamps

# API Endpoints

## Health and Auth

- `GET /api/health` – System and dependency health.
- `POST /api/auth/register` – Register a user.
- `POST /api/auth/login` – Authenticate and issue JWT.
- `GET /api/auth/me` – Fetch current profile.
- `POST /api/auth/logout` – Clear server-managed session state if used.

## Chat and Conversations

- `POST /api/chat` – Start or continue a RAG chat request.
- `GET /api/chat/stream` – Stream answer events when using HTTP streaming.
- `GET /api/conversations` – List current user conversations.
- `POST /api/conversations` – Create a conversation.
- `GET /api/conversations/:id` – Fetch conversation and messages.
- `DELETE /api/conversations/:id` – Delete/archive a user conversation.
- `GET /api/conversations/:id/export` – Export a conversation.
- `POST /api/messages/:id/feedback` – Submit answer feedback.

## Knowledge Bases

- `GET /api/knowledge-bases` – List accessible knowledge bases.
- `GET /api/knowledge-bases/:id` – Fetch collection details.
- `GET /api/knowledge-bases/:id/suggestions` – Fetch suggested questions.

## Admin Knowledge Bases

- `POST /api/admin/knowledge-bases` – Create a knowledge base.
- `PUT /api/admin/knowledge-bases/:id` – Update a knowledge base.
- `POST /api/admin/knowledge-bases/:id/activate` – Activate a knowledge base.
- `POST /api/admin/knowledge-bases/:id/archive` – Archive a knowledge base.

## Admin Documents

- `GET /api/admin/documents` – List and filter documents.
- `POST /api/admin/documents/upload` – Upload a document.
- `GET /api/admin/documents/:id` – Fetch document details.
- `PUT /api/admin/documents/:id` – Update document metadata.
- `DELETE /api/admin/documents/:id` – Archive/delete according to version policy.
- `POST /api/admin/documents/:id/reprocess` – Re-run extraction and indexing.
- `GET /api/admin/documents/:id/versions` – List document versions.
- `POST /api/admin/documents/:id/versions` – Upload a replacement version.
- `POST /api/admin/documents/:id/restore/:versionId` – Restore a version when allowed.

## Retrieval and System Diagnostics

- `POST /api/rag/search` – Protected diagnostic retrieval endpoint for authorized roles.
- `GET /api/admin/rag/health` – Embedding, vector search, and retrieval health.
- `GET /api/admin/analytics` – Aggregated platform analytics.
- `GET /api/admin/analytics/unanswered` – Unanswered or low-confidence questions.
- `GET /api/admin/analytics/feedback` – Answer feedback analytics.

# Folder Structure & Development Phases

## Frontend Structure

```text
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── Chat/
    │   │   ├── ChatWindow/
    │   │   ├── MessageBubble/
    │   │   ├── SourceCard/
    │   │   ├── SourceHighlight/
    │   │   ├── SuggestedQuestions/
    │   │   ├── FeedbackControls/
    │   │   └── VoiceControls/
    │   ├── KnowledgeBase/
    │   ├── Documents/
    │   ├── Analytics/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── settings.js
    │   ├── chat/
    │   │   ├── index.js
    │   │   └── [id].js
    │   ├── knowledge-bases/
    │   │   └── index.js
    │   └── admin/
    │       ├── index.js
    │       ├── documents/
    │       │   ├── index.js
    │       │   ├── upload.js
    │       │   └── [id].js
    │       ├── knowledge-bases.js
    │       ├── analytics.js
    │       └── settings.js
    ├── store/
    │   ├── authStore.js
    │   ├── chatStore.js
    │   └── knowledgeBaseStore.js
    └── services/
        ├── api.js
        ├── chatStream.js
        └── voice.js
```

## Backend Structure

```text
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   ├── ai.js
    │   └── socket.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   ├── conversationRoutes.js
    │   ├── knowledgeBaseRoutes.js
    │   ├── documentRoutes.js
    │   ├── adminRoutes.js
    │   └── analyticsRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── chatController.js
    │   ├── conversationController.js
    │   ├── knowledgeBaseController.js
    │   ├── documentController.js
    │   └── analyticsController.js
    ├── services/
    │   ├── authService.js
    │   ├── chatService.js
    │   ├── conversationService.js
    │   ├── knowledgeBaseService.js
    │   ├── documentService.js
    │   ├── storageService.js
    │   ├── analyticsService.js
    │   └── languageService.js
    ├── rag/
    │   ├── ingestionService.js
    │   ├── parserService.js
    │   ├── ocrService.js
    │   ├── chunkingService.js
    │   ├── embeddingService.js
    │   ├── vectorStoreService.js
    │   ├── keywordSearchService.js
    │   ├── hybridSearchService.js
    │   ├── rerankerService.js
    │   ├── retrievalService.js
    │   ├── contextBuilder.js
    │   └── ragPipeline.js
    ├── ai/
    │   ├── providerFactory.js
    │   ├── openRouterProvider.js
    │   ├── geminiProvider.js
    │   ├── answerGenerator.js
    │   ├── summaryGenerator.js
    │   └── faqGenerator.js
    ├── models/
    │   ├── User.js
    │   ├── KnowledgeBase.js
    │   ├── Document.js
    │   ├── DocumentVersion.js
    │   ├── DocumentChunk.js
    │   ├── Conversation.js
    │   ├── Message.js
    │   ├── Feedback.js
    │   ├── QueryAnalytics.js
    │   └── ProcessingJob.js
    ├── queues/
    │   └── documentProcessingQueue.js
    └── workers/
        └── documentWorker.js
```

## Development Phases

### Phase 1: Foundation

Build:

- Next.js frontend.
- Express backend.
- MongoDB connection.
- JWT authentication.
- Role-based authorization.
- Zustand auth state.
- Basic responsive AppShell.
- Login and registration.
- Landing page.
- Health endpoint.

The phase is complete only when users can register, log in, remain authenticated, and access protected pages according to role.

### Phase 2: Knowledge Bases and Document Management

Build:

- Knowledge base CRUD.
- Department-wise collections.
- Admin dashboard.
- Document upload.
- File storage abstraction.
- Document list and filtering.
- Document status tracking.
- Role-based access rules.

The phase is complete only when an admin can create collections and upload documents into the correct knowledge base.

### Phase 3: Document Processing and Vector Indexing

Build:

- PDF/DOCX/TXT/Markdown extraction.
- OCR fallback.
- Cleaning and normalization.
- Chunking.
- Embedding generation.
- MongoDB Atlas Vector Search indexing.
- Background processing queue.
- Retry and failure reporting.
- Reprocessing controls.

The phase is complete only when an uploaded document produces searchable chunks with source metadata.

### Phase 4: Core RAG Chatbot

Build:

- Semantic search.
- Keyword search.
- Hybrid result merging.
- Re-ranking.
- Context construction.
- Grounded LLM prompts.
- Unknown-answer handling.
- Source display.
- Confidence/relevance indicators.
- Streaming responses.

The phase is complete only when the chatbot can answer a question using retrieved document evidence and display the exact supporting sources.

### Phase 5: Conversations and Advanced Student Features

Build:

- Persistent chat history.
- Conversation context.
- Suggested questions.
- Answer feedback.
- Conversation export.
- Multilingual interaction.
- Voice input.
- Voice responses.

The phase is complete only when students can have multi-turn conversations and use the main accessibility/productivity features.

### Phase 6: Admin Intelligence and RAG Quality

Build:

- Document version management.
- Source highlighting.
- Document summaries.
- AI-generated FAQs.
- Admin analytics.
- Unanswered question reports.
- Low-confidence reports.
- Retrieval quality metrics.
- Feedback analytics.

The phase is complete only when admins can understand what students ask, where the knowledge base is weak, and how to improve retrieval quality.

### Phase 7: Deployment and Production Validation

Deploy using the architecture:

**Frontend → Vercel**  
**Backend → Render**  
**Database + Vector Search → MongoDB Atlas**  
**Source Code → GitHub**

Validate:

- production authentication
- production CORS
- document upload
- background processing
- vector retrieval
- LLM generation
- source display
- mobile responsiveness
- role access
- environment variables
- browser console
- backend logs

# UI, Security, RAG Quality, Outcome, and AI Agent Instructions

## UI and UX Requirements

The UI must feel like a modern AI knowledge assistant rather than a generic form application.

The chat experience must:

- keep the input prominently accessible
- distinguish user and assistant messages
- stream generated text naturally
- show source cards beneath answers
- show confidence/relevance without overwhelming the user
- provide useful empty states
- clearly indicate when no information is found
- support mobile layouts
- support loading and processing states
- make department/knowledge-base scope visible
- make admin actions visually separate from student actions

The admin document interface must make it easy to understand:

- what document is active
- which version is current
- whether processing succeeded
- whether OCR was used
- how many chunks were indexed
- which knowledge base owns the document
- why a document failed

## Security Requirements

The application must:

- hash passwords with bcrypt cost 12
- sign and verify JWTs with `JWT_SECRET`
- protect routes by role
- validate uploaded file types and sizes
- sanitize user input
- validate request bodies with `express-validator`
- apply rate limiting to authentication and chat endpoints
- use `helmet`
- restrict CORS to `CLIENT_URL`
- keep all secrets in environment variables
- never expose private AI provider keys to the frontend
- never expose database credentials
- enforce file upload authorization
- verify that users can access a knowledge base before retrieval
- prevent one department from searching another department's restricted documents
- avoid logging private source content unnecessarily

## Environment Variables

Typical backend variables include:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key

EMBEDDING_PROVIDER=gemini
EMBEDDING_MODEL=your_embedding_model
CHAT_MODEL=your_chat_model

VECTOR_INDEX_NAME=college_documents_vector_index

REDIS_URL=your_redis_url

DOCUMENT_STORAGE_PROVIDER=local
MAX_UPLOAD_SIZE_MB=20
```

Exact variable names may be adjusted during implementation, but secrets must remain server-side.

## RAG Quality Rules

The AI coding agent must treat these as non-negotiable:

1. A response is not a RAG answer unless retrieval occurs.
2. Every retrieved answer must carry source metadata.
3. If retrieval evidence is insufficient, return an unavailable-information response.
4. Do not use conversation history as a substitute for retrieval.
5. Do not mix unauthorized knowledge-base content into a response.
6. Do not call the LLM before retrieval is complete.
7. Do not calculate confidence from arbitrary hardcoded values.
8. Confidence must be derived from retrieval/re-ranking evidence and labeled as relevance, not guaranteed truth.
9. Preserve document versions so existing answers can be audited.
10. Store enough metadata to reproduce why an answer was generated.
11. Never fabricate source references.
12. If OCR or extraction fails, surface the failure to the admin.
13. Keep RAG stages modular and independently testable.

## Final Expected Outcome

The completed platform must let a student ask a college-related question and receive a fast, grounded answer backed by the institution's own documents.

An admin must be able to upload a college document, have it processed into searchable chunks, assign it to the correct knowledge base or department, monitor processing, update it through versions, and see how students interact with the resulting information.

The final product should support questions about admissions, departments, courses, fees, examinations, academic calendars, hostels, libraries, clubs, placements, scholarships, policies, events, and other college services.

The final experience should feel like a dedicated institutional AI assistant: students ask naturally, the system retrieves relevant college knowledge, the AI explains the answer, and the platform shows exactly where the information came from.

## AI Coding Agent Implementation Instructions

The AI coding agent must build the application phase by phase and must not skip ahead.

It must:

- follow the folder structure strictly
- keep controllers thin
- keep business logic inside services
- keep all RAG logic inside dedicated RAG services
- centralize AI provider access
- centralize embedding provider access
- never query MongoDB directly from controllers
- never call an LLM from a controller
- never generate embeddings from a controller or model
- never bypass authorization during retrieval
- preserve document and version metadata
- write processing and analytics events for important RAG stages
- process documents asynchronously
- provide clear processing errors
- implement real retrieval before answer generation
- implement real source display before calling the RAG chatbot complete
- report the files created or changed at the end of every phase
- run and fix lint/build errors before declaring a phase complete
- test the phase against the acceptance criteria before moving to the next phase

## Where Each Specification Parameter Shows Up

- **Clarity:** The Project Overview and Final Expected Outcome explicitly define the primary user, the knowledge source, and the required retrieval-to-answer flow.
- **Completeness:** The specification covers authentication, documents, OCR, chunking, embeddings, vector search, hybrid retrieval, re-ranking, generation, sources, conversations, admin features, analytics, security, and deployment.
- **Consistency:** The same domain concepts—KnowledgeBases, Documents, DocumentVersions, DocumentChunks, Conversations, Messages, and Feedback—are used consistently across frontend, backend, API, and database sections.
- **Concrete Technology Choices:** The stack explicitly identifies Next.js, Express, MongoDB Atlas Vector Search, LangChain, OpenRouter, Gemini, BullMQ, Redis, and Socket.IO.
- **Structured Sections:** The document separates product requirements, RAG behavior, pages, backend architecture, collections, APIs, folders, phases, and quality rules.
- **Phased Delivery:** Seven phases provide functional checkpoints and prevent the project from becoming one large uncontrolled build.
- **Authoritative Tone:** Strong requirements such as “must,” “never,” and “non-negotiable” prevent an AI coding agent from replacing the RAG architecture with a simple direct LLM chatbot.
