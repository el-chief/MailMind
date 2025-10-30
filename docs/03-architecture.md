# 🏗️ MailMind — System Architecture

**Version:** 1.0  
**Date:** October 30, 2025

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
└────────────┬────────────────────────────────────────┬───────────┘
             │                                        │
             │ HTTPS                                  │ OAuth Flow
             ▼                                        ▼
┌────────────────────────┐                  ┌─────────────────────┐
│   FRONTEND (React)     │                  │  Google OAuth API   │
│  - Dashboard UI        │                  │  - Authentication   │
│  - Search & Filter     │                  │  - Token Exchange   │
│  - Settings            │                  └─────────────────────┘
│                        │                           │
│  Hosted: GitHub Pages  │                           │ Gmail API
│  or Netlify (Free)     │                           ▼
└────────────┬───────────┘                  ┌─────────────────────┐
             │                               │   Gmail API         │
             │ REST API                      │  - Fetch Messages   │
             ▼                               │  - Read Metadata    │
┌────────────────────────┐                  └──────────┬──────────┘
│  BACKEND (Node.js)     │◄────────────────────────────┘
│  - Express Server      │
│  - API Endpoints       │
│  - Auth Middleware     │         ┌──────────────────────────┐
│  - Task Scheduler      │◄────────┤  GitHub Actions (Cron)   │
│                        │         │  - Daily Trigger         │
│  Hosted: Render or     │         │  - Calls /api/tasks      │
│  Railway (Free Tier)   │         └──────────────────────────┘
└────────┬───────────────┘
         │
         │ LangGraph Workflow
         ▼
┌────────────────────────────────────────────────────────────────┐
│              AI SUMMARIZATION PIPELINE (LangGraph)             │
│                                                                 │
│  ┌─────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   │
│  │ Fetch   │──▶│Preprocess│──▶│ Summarize │──▶│ Structure│   │
│  │ Emails  │   │  (Clean) │   │  (LLM)    │   │  (JSON)  │   │
│  └─────────┘   └──────────┘   └─────┬─────┘   └────┬─────┘   │
│                                      │               │         │
│                                      ▼               ▼         │
│                              ┌────────────┐   ┌──────────┐    │
│                              │ LLM Engine │   │  Store   │    │
│                              │ (Ollama or │   │   DB     │    │
│                              │  OpenAI)   │   └────┬─────┘    │
│                              └────────────┘        │          │
│                                                    ▼          │
│                                              ┌──────────┐     │
│                                              │  Notify  │     │
│                                              │(Telegram)│     │
│                                              └──────────┘     │
└────────────────────────────────────────────────────────────────┘
         │
         │ Store Results
         ▼
┌────────────────────────┐
│  DATABASE              │
│  MongoDB Atlas (Free)  │
│  - users               │
│  - summaries           │
│  - runs (logs)         │
└────────────────────────┘
         │
         │ Send Notifications
         ▼
┌────────────────────────┐
│  NOTIFICATIONS         │
│  - Telegram Bot        │
│  - Discord Webhook     │
└────────────────────────┘
```

---

## 🧩 Component Breakdown

### 1. Frontend (Client-Side)

**Technology:** React 18 + TypeScript + Vite

**Responsibilities:**
- User interface and dashboard
- OAuth initiation
- API communication
- State management (React Context or Zustand)
- Routing (React Router)
- Responsive design

**Key Pages:**
- `/` - Landing page
- `/dashboard` - Today's summaries
- `/history` - Previous days
- `/search` - Search interface
- `/settings` - User preferences
- `/login` - OAuth entry point

**Hosting:** GitHub Pages or Netlify (free tier)

**Build Output:** Static files (HTML, CSS, JS)

---

### 2. Backend (Server-Side)

**Technology:** Node.js 20 + TypeScript + Express

**Responsibilities:**
- REST API endpoints
- OAuth token management
- Session handling (JWT or cookies)
- Business logic orchestration
- Rate limiting and security
- Error handling and logging

**Project Structure:**
```
backend/
├── src/
│   ├── config/           # Environment config
│   ├── routes/           # API route handlers
│   │   ├── auth.ts
│   │   ├── summaries.ts
│   │   ├── tasks.ts
│   │   └── settings.ts
│   ├── services/         # Business logic
│   │   ├── gmail.service.ts
│   │   ├── langgraph.service.ts
│   │   ├── llm.service.ts
│   │   └── notification.service.ts
│   ├── models/           # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Summary.ts
│   │   └── Run.ts
│   ├── middleware/       # Auth, logging, etc.
│   ├── utils/            # Helper functions
│   └── server.ts         # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

**Hosting:** Render or Railway free tier

**Port:** 3000 (configurable via env)

---

### 3. AI Summarization Pipeline (LangGraph)

**Technology:** LangGraph (TypeScript SDK)

**Workflow Nodes:**

#### Node 1: Fetch Messages
- **Input:** User ID, date range
- **Process:** Call Gmail API, retrieve messages
- **Output:** Array of raw email objects

#### Node 2: Preprocess
- **Input:** Raw email objects
- **Process:**
  - Decode base64 content
  - Strip HTML tags
  - Extract plain text
  - Truncate if >10k characters
  - Identify attachments
- **Output:** Cleaned email text

#### Node 3: Summarize (LLM)
- **Input:** Cleaned email text
- **Process:**
  - Send to LLM with structured prompt
  - Request summary in specific format
  - Extract key points and action items
- **Output:** Raw summary text

#### Node 4: Structure
- **Input:** Raw summary text
- **Process:**
  - Parse LLM response
  - Extract JSON structure
  - Add metadata (timestamp, sender, tags)
  - Validate format
- **Output:** Structured summary object

#### Node 5: Store
- **Input:** Structured summary object
- **Process:**
  - Save to MongoDB
  - Handle duplicates (upsert)
  - Update user stats
- **Output:** Database record ID

#### Node 6: Notify (Optional)
- **Input:** Summary count, highlights
- **Process:**
  - Check user notification preferences
  - Format message
  - Send via Telegram/Discord
- **Output:** Notification status

**State Management:** LangGraph maintains state between nodes

**Error Handling:** Each node has try-catch, failed emails logged but don't break pipeline

---

### 4. LLM Integration Layer

**Supported Providers:**

#### Option A: Ollama (Local Development)
- **Model:** llama3.1:8b or mistral:7b
- **Endpoint:** `http://localhost:11434`
- **Pros:** Free, private, no API limits
- **Cons:** Requires local setup, slower

#### Option B: OpenAI
- **Model:** gpt-4o-mini or gpt-3.5-turbo
- **Endpoint:** `https://api.openai.com/v1`
- **Pros:** Fast, reliable, high quality
- **Cons:** Costs money (but cheap for summaries)

#### Option C: OpenRouter
- **Model:** Various (Llama, Mistral, etc.)
- **Endpoint:** `https://openrouter.ai/api/v1`
- **Pros:** Multiple models, competitive pricing
- **Cons:** External dependency

#### Option D: Groq
- **Model:** llama3-70b or mixtral-8x7b
- **Endpoint:** `https://api.groq.com/openai/v1`
- **Pros:** Very fast inference, generous free tier
- **Cons:** Rate limits on free tier

**Abstraction Layer:**
```typescript
interface LLMProvider {
  generateSummary(emailText: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}

class LLMService {
  private provider: LLMProvider;
  
  constructor() {
    // Select provider based on env
    const provider = process.env.LLM_PROVIDER || 'ollama';
    this.provider = this.createProvider(provider);
  }
  
  async summarize(emailText: string): Promise<string> {
    return await this.provider.generateSummary(emailText);
  }
}
```

---

### 5. Database (MongoDB Atlas)

**Tier:** Free M0 Cluster (512 MB storage)

**Collections:**

#### `users`
```javascript
{
  _id: ObjectId,
  googleId: String (unique),
  email: String,
  name: String,
  picture: String (avatar URL),
  tokens: {
    accessToken: String (encrypted),
    refreshToken: String (encrypted),
    expiresAt: Date
  },
  settings: {
    notificationsEnabled: Boolean,
    notificationChannel: String ('telegram' | 'discord'),
    telegramChatId: String,
    discordWebhook: String,
    timezone: String,
    retentionDays: Number
  },
  createdAt: Date,
  lastLoginAt: Date,
  lastSummaryAt: Date
}
```

#### `summaries`
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  emailId: String (Gmail message ID, unique per user),
  threadId: String (Gmail thread ID),
  sender: {
    name: String,
    email: String
  },
  subject: String,
  summary: String,
  keyPoints: [String],
  actionItems: [String],
  tags: [String], // 'work', 'personal', 'newsletter', 'receipt', etc.
  sentiment: String ('neutral', 'urgent', 'promotional'),
  hasAttachments: Boolean,
  attachmentCount: Number,
  receivedAt: Date,
  summarizedAt: Date,
  llmProvider: String,
  llmModel: String,
  processingTimeMs: Number,
  createdAt: Date
}
```

**Indexes:**
- `summaries`: `{ userId: 1, emailId: 1 }` (unique)
- `summaries`: `{ userId: 1, receivedAt: -1 }` (for date queries)
- `summaries`: `{ userId: 1, tags: 1 }` (for filtering)
- `users`: `{ googleId: 1 }` (unique)

#### `runs` (Optional - for debugging)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  status: String ('success' | 'partial' | 'failed'),
  emailsProcessed: Number,
  emailsFailed: Number,
  summariesCreated: Number,
  duration: Number (ms),
  errors: [String],
  startedAt: Date,
  completedAt: Date
}
```

---

### 6. Daily Automation (GitHub Actions)

**Workflow File:** `.github/workflows/daily-summary.yml`

```yaml
name: Daily Email Summary

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM UTC daily
  workflow_dispatch:      # Manual trigger

jobs:
  run-summary:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Backend Task
        run: |
          curl -X POST ${{ secrets.BACKEND_URL }}/api/tasks/runDaily \
            -H "Authorization: Bearer ${{ secrets.TASKS_SECRET }}" \
            -H "Content-Type: application/json"
```

**Environment Secrets:**
- `BACKEND_URL`: Backend API URL (e.g., https://mailmind.onrender.com)
- `TASKS_SECRET`: Secret token to authenticate cron job

**Benefits:**
- Free to run
- Reliable scheduling
- No server-side cron needed
- Easy to monitor in GitHub UI

---

## 🔐 Security Architecture

### Authentication Flow

1. **User clicks "Sign in with Google"**
2. Frontend redirects to `/api/auth/google`
3. Backend generates OAuth URL with scopes
4. User authorizes on Google
5. Google redirects to `/api/auth/google/callback?code=...`
6. Backend exchanges code for tokens
7. Backend creates/updates user in DB
8. Backend creates session (JWT or cookie)
9. Frontend receives session token
10. Frontend stores token in localStorage/cookie
11. Frontend includes token in API requests

### API Security

- **CORS:** Restrict to frontend domain only
- **Rate Limiting:** 100 requests/15min per IP
- **JWT Tokens:** Expire after 7 days
- **HTTPS Only:** Enforce TLS in production
- **Secrets:** Never log or expose tokens
- **Input Validation:** Sanitize all user inputs

### Data Security

- **Token Encryption:** Encrypt OAuth tokens at rest
- **Environment Variables:** Never commit secrets
- **Read-Only Access:** Gmail API read-only scope
- **Data Retention:** Auto-delete old summaries
- **User Data Deletion:** Complete GDPR compliance

---

## 🌐 Deployment Architecture

### Production Environment

**Frontend:**
- **Host:** GitHub Pages or Netlify
- **Domain:** mailmind.app (custom domain optional)
- **SSL:** Automatic via hosting provider
- **CDN:** Included with hosting
- **Build:** `npm run build` → static files

**Backend:**
- **Host:** Render (recommended) or Railway
- **Instance:** Free tier (sleep after 15min inactivity)
- **SSL:** Automatic HTTPS
- **Health Check:** `/api/health` endpoint
- **Logs:** Pino structured logging

**Database:**
- **Host:** MongoDB Atlas
- **Region:** Closest to backend (e.g., us-east-1)
- **Backup:** Automatic daily snapshots (free tier)
- **Connection:** MongoDB URI in env variable

**LLM (Production Options):**
- **Option 1:** Groq API (free tier, fast)
- **Option 2:** OpenAI API (paid, reliable)
- **Option 3:** OpenRouter (flexible)

### Development Environment

**Frontend:**
- **Run:** `npm run dev` (Vite dev server)
- **Port:** 5173
- **Hot Reload:** Enabled

**Backend:**
- **Run:** `npm run dev` (nodemon + ts-node)
- **Port:** 3000
- **Watch Mode:** Auto-restart on changes

**Database:**
- **Option 1:** MongoDB Atlas (free cluster)
- **Option 2:** Local MongoDB (Docker)

**LLM:**
- **Ollama:** `ollama serve` on localhost:11434
- **Model:** `ollama pull llama3.1:8b`

---

## 📊 Data Flow Diagram

### Daily Summary Generation Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. GitHub Actions Cron (8 AM daily)                         │
└────────────────────────┬─────────────────────────────────────┘
                         │ POST /api/tasks/runDaily
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Backend Task Endpoint                                     │
│    - Validate secret token                                   │
│    - Fetch all active users                                  │
└────────────────────────┬─────────────────────────────────────┘
                         │ For each user
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Gmail Service                                             │
│    - Refresh OAuth token if needed                           │
│    - Call Gmail API: messages.list (last 24h)                │
│    - Fetch message details: messages.get                     │
└────────────────────────┬─────────────────────────────────────┘
                         │ Array of emails
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. LangGraph Pipeline                                        │
│    - Preprocess each email (clean HTML, decode)              │
│    - Batch summarize with LLM                                │
│    - Structure summaries (JSON format)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │ Structured summaries
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Database Service                                          │
│    - Insert summaries to MongoDB                             │
│    - Update user's lastSummaryAt                             │
│    - Log run statistics                                      │
└────────────────────────┬─────────────────────────────────────┘
                         │ Success count
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Notification Service (if enabled)                         │
│    - Format daily digest                                     │
│    - Send via Telegram/Discord                               │
└──────────────────────────────────────────────────────────────┘
```

### User Dashboard Access Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User opens mailmind.app/dashboard                         │
└────────────────────────┬─────────────────────────────────────┘
                         │ Check JWT token
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Frontend Auth Check                                       │
│    - Token valid? → Proceed                                  │
│    - Token invalid? → Redirect to /login                     │
└────────────────────────┬─────────────────────────────────────┘
                         │ GET /api/summaries?date=today
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend API                                               │
│    - Validate JWT                                            │
│    - Extract userId                                          │
│    - Query MongoDB for today's summaries                     │
└────────────────────────┬─────────────────────────────────────┘
                         │ JSON response
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Frontend Renders Dashboard                                │
│    - Display summaries in cards                              │
│    - Show stats and filters                                  │
│    - Enable search functionality                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack Summary

| Component | Technology | Alternatives Considered |
|-----------|------------|-------------------------|
| **Frontend** | React 18 + TypeScript + Vite | Vue.js, Svelte, Next.js |
| **Backend** | Node.js 20 + Express + TypeScript | Fastify, Koa, Hono |
| **AI Workflow** | LangGraph (TypeScript) | Custom orchestration, Temporal |
| **LLM** | Ollama (dev) / Groq (prod) | OpenAI, Anthropic, Together.ai |
| **Database** | MongoDB Atlas | PostgreSQL, Supabase, Firebase |
| **Auth** | Google OAuth (googleapis) | Auth0, Clerk, Firebase Auth |
| **Scheduler** | GitHub Actions Cron | Cron job, AWS Lambda, Render Cron |
| **Frontend Hosting** | GitHub Pages / Netlify | Vercel, Cloudflare Pages |
| **Backend Hosting** | Render / Railway | Fly.io, Heroku, AWS Lambda |
| **Notifications** | Telegram Bot, Discord Webhook | Email, Slack, Push notifications |
| **Logging** | Pino | Winston, Bunyan, console |
| **Testing** | Vitest + React Testing Library | Jest, Playwright |

---

## 📈 Scalability Considerations

### Current Architecture (MVP)
- **Users:** Up to 100 users
- **Emails/day:** 50-500 per user
- **Requests:** ~1000 API calls/day
- **Storage:** <512 MB (MongoDB free tier)

### Future Scalability (Post-MVP)
- **Horizontal Scaling:** Add more backend instances behind load balancer
- **Database:** Upgrade to paid MongoDB tier or shard collections
- **Caching:** Add Redis for frequently accessed summaries
- **Queue:** Use BullMQ for async email processing
- **CDN:** Cache static assets globally
- **LLM:** Implement request batching and caching

---

## 🔍 Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Daily summary job success rate
- LLM API latency and errors
- Database query performance
- OAuth token refresh failures
- User retention (daily active users)

### Logging Strategy
- **Structured Logs:** JSON format with Pino
- **Log Levels:** error, warn, info, debug
- **Context:** Include userId, requestId, timestamp
- **Sensitive Data:** Never log tokens or email content

### Error Handling
- Catch all errors at route level
- Return user-friendly error messages
- Log detailed errors server-side
- Alert on critical failures (optional: Sentry)

---

**Last Updated:** October 30, 2025
