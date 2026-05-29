# OurApp — Real-Time Chat with RAG-Powered Policy Intelligence

> A full-stack messaging platform where group admins upload policy documents and users get instant, context-aware answers — powered by Gemini + MongoDB Atlas Vector Search.

🌐 **Live Demo:** [ourapp1.netlify.app](https://ourapp1.netlify.app)

---

## What Makes This Different

Most chat apps let you *send* information. OurApp lets you *query* it.

Group admins can upload policy documents directly into the chat. Users can then ask natural language questions about those policies — and get accurate, document-grounded answers in real time, powered by a RAG (Retrieval-Augmented Generation) pipeline built with Google Gemini and MongoDB Atlas Vector Search.

**The RAG pipeline in plain English:**
1. Admin uploads a policy PDF to the group
2. The document is chunked, embedded, and stored as vectors in MongoDB Atlas
3. A user asks a question in the chat
4. The query is embedded and matched against stored vectors (semantic search)
5. The most relevant document chunks are retrieved and passed to Gemini as context
6. Gemini generates a grounded, accurate response — not a hallucination

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         (Real-time chat UI + Document Upload)           │
└──────────────────────┬──────────────────────────────────┘
                       │ REST + WebSocket (STOMP/SockJS)
┌──────────────────────▼──────────────────────────────────┐
│                  Spring Boot Backend                     │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  WebSocket  │  │  REST APIs   │  │  RAG Service  │  │
│  │  Controller │  │  (Auth/Chat) │  │               │  │
│  └─────────────┘  └──────────────┘  └───────┬───────┘  │
│                                             │           │
│                              ┌──────────────▼─────────┐ │
│                              │   Gemini API (LLM)     │ │
│                              │   + Embedding Model    │ │
│                              └──────────────┬─────────┘ │
└─────────────────────────────────────────────┼───────────┘
                                              │
┌─────────────────────────────────────────────▼───────────┐
│                  MongoDB Atlas                           │
│                                                         │
│   ┌─────────────────┐    ┌───────────────────────────┐  │
│   │  Standard       │    │  Vector Search Collection  │  │
│   │  Collections    │    │  (Policy embeddings +      │  │
│   │  (Users/Chats/  │    │   metadata)                │  │
│   │   Groups)       │    └───────────────────────────┘  │
│   └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Java 17 + Spring Boot 3.x** | Core backend framework |
| **Spring WebSocket (STOMP)** | Real-time bidirectional messaging |
| **Spring Security + JWT** | Authentication & authorization |
| **Spring Data MongoDB** | Database ORM and repositories |
| **Google Gemini API** | LLM for RAG responses + embeddings |
| **MongoDB Atlas Vector Search** | Semantic search over policy documents |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks + context |
| **Vite** | Build tool and dev server |
| **SockJS + STOMP.js** | WebSocket client |
| **Styled Components** | Component-scoped CSS |
| **Axios** | HTTP client for REST APIs |

### Infrastructure
| Technology | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud DB + Vector Search index |
| **Netlify** | Frontend deployment |
| **Docker** | Optional containerisation |

---

## Features

### 🤖 RAG-Powered Policy Intelligence *(Key Feature)*
- Group admins upload policy documents (PDF/text) to the group
- Documents are chunked, embedded via Gemini's embedding model, and indexed in MongoDB Atlas Vector Search
- Users ask natural language questions in the chat
- Semantic search retrieves the most relevant document chunks
- Gemini generates accurate, context-grounded answers
- Fully integrated into the chat UI — feels like asking a teammate, not querying a database

### 💬 Real-Time Messaging
- Private messaging with instant delivery via WebSockets
- Group chat with multi-member support
- Typing indicators for both private and group chats
- Message history with timestamps

### 👥 Group Management
- Create and manage groups with role-based permissions
- Admin controls: add/remove members, upload policy documents, update group settings
- Separate WebSocket channels per group (`/app/group-typing`, `/topic/group/{id}`)

### 🔐 Authentication & Security
- JWT-based login and registration with refresh token support
- Role-based access control (admin vs. member) enforced on sensitive endpoints
- Secure session persistence with proper token management

### 📱 Responsive Design
- Mobile-first layout with custom navigation for small screens
- Touch-friendly components with proper tap targets
- Adaptive layouts from 320px to 1440px+

---

## Engineering Decisions & What I Learned

### Why MongoDB Atlas Vector Search over Pinecone or FAISS?
I already used MongoDB for user and chat data. Keeping embeddings in the same database eliminated an external service dependency and simplified the data model — policy document metadata and its vector lived in the same document. For a project at this scale, operational simplicity outweighed the marginal performance gains of a dedicated vector DB.

### Why Gemini for both embeddings and generation?
Using one provider for both the embedding model and the generative model meant consistent vector space alignment — the query embedding and document embeddings were produced by the same model, improving retrieval accuracy. It also reduced API key management overhead.

### WebSocket subscription race condition
When a user switched between chat rooms rapidly, the STOMP subscription from the previous room was still active, causing messages to arrive in the wrong chat window. Fixed by explicitly unsubscribing from the previous room's topic before subscribing to the new one — a subtle but critical bug in any real-time app.

### Chunk size strategy for RAG
Initial chunking used fixed 500-token chunks with no overlap, causing context to be split mid-sentence at boundaries. Moved to 400-token chunks with 50-token overlap to preserve semantic continuity across chunk boundaries — noticeably improved answer quality for policy questions that spanned paragraphs.

### JWT + Spring Security integration
Spring Security's default filter chain conflicted with WebSocket upgrade requests. Configured a custom `SecurityFilterChain` to permit WebSocket handshake endpoints while enforcing JWT validation on all REST API routes.

---

## What I'd Build Next

- **Streaming responses** — pipe Gemini's output token-by-token to the chat UI for a ChatGPT-like experience
- **Multi-document RAG** — allow multiple policy docs per group with source attribution in answers
- **Conversation memory** — include recent chat history in the RAG context window for follow-up questions
- **Admin analytics** — track which policy sections are queried most to surface gaps in documentation

---

## Local Setup

### Prerequisites
- Java 17+, Maven
- Node.js 18+, npm/yarn
- MongoDB Atlas account (free tier works)
- Google Gemini API key

### Backend
```bash
cd server
# Add to application.properties:
# spring.data.mongodb.uri=<your-atlas-uri>
# gemini.api.key=<your-gemini-key>
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd Client
yarn install
yarn dev
# Runs on http://localhost:5173
```

---

## Project Structure

```
OurApp/
├── Client/                          # React frontend
│   └── src/
│       ├── component/               # Chat, contacts, groups UI
│       ├── pages/                   # Chat, Login, Register
│       ├── context/                 # AuthContext
│       └── utils/                   # WebSocket, API helpers
│
└── server/                          # Spring Boot backend
    └── src/main/java/
        ├── config/                  # Security, WebSocket, CORS
        ├── controllers/             # REST + WebSocket controllers
        ├── entities/                # MongoDB documents
        ├── repositories/            # Data + Vector repositories
        ├── services/                # Business logic + RAG pipeline
        └── security/                # JWT filter, auth
```

---

## Author

**Gaurav Singh** — Backend Engineer | Java · Spring Boot · Kafka · Microservices · RAG

[LinkedIn](https://www.linkedin.com/in/gaurav-singh-5011) · [Resume](https://tinyurl.com/gaurbresume) · [Live Demo](https://ourapp1.netlify.app)
