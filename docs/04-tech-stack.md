# 🛠️ MailMind — Technology Stack Documentation

**Version:** 1.0  
**Date:** October 30, 2025

---

## 📚 Complete Technology Stack

### Frontend

#### Core Framework
- **React 18.3+** - UI library
- **TypeScript 5.3+** - Type safety
- **Vite 5+** - Build tool and dev server

**Rationale:**
- React: Most popular, excellent ecosystem, great hiring pool
- TypeScript: Prevents bugs, improves DX, self-documenting code
- Vite: Lightning-fast HMR, modern build tool, better than CRA

#### UI & Styling
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **Radix UI** or **Headless UI** - Accessible components
- **Lucide React** - Icon library

**Rationale:**
- Tailwind: Fast styling, small bundle, highly customizable
- Radix/Headless: Accessible out-of-the-box, unstyled (flexible)
- Lucide: Modern icons, tree-shakeable, lightweight

#### State Management
- **Zustand** or **React Context** - Global state
- **TanStack Query (React Query)** - Server state

**Rationale:**
- Zustand: Simple, minimal boilerplate, better than Redux for small apps
- React Query: Automatic caching, refetching, loading states

#### Routing
- **React Router 6+** - Client-side routing

**Rationale:**
- De facto standard for React routing
- Nested routes, lazy loading, data loading APIs

#### Forms
- **React Hook Form** - Form state management
- **Zod** - Schema validation

**Rationale:**
- React Hook Form: Minimal re-renders, great DX
- Zod: TypeScript-first validation, inference

#### Date & Time
- **date-fns** - Date manipulation

**Rationale:**
- Modular, tree-shakeable (smaller than moment.js)
- Functional API, immutable

#### Charts (Optional)
- **Recharts** or **Chart.js + react-chartjs-2**

**Rationale:**
- Recharts: React-native charts, composable
- Chart.js: More features, battle-tested

---

### Backend

#### Runtime & Framework
- **Node.js 20 LTS** - JavaScript runtime
- **TypeScript 5.3+** - Type safety
- **Express 4.18+** - Web framework

**Rationale:**
- Node.js 20: Latest LTS, native fetch, performance improvements
- TypeScript: Same as frontend, shared types possible
- Express: Most popular Node.js framework, huge ecosystem, battle-tested

#### API Design
- **OpenAPI 3.1** - API specification (optional docs)
- **swagger-ui-express** - Auto-generate API docs

**Rationale:**
- Auto-generated API docs for frontend devs
- Interactive API documentation
- Easy to integrate with Express

#### Authentication
- **googleapis** - Google OAuth + Gmail API client
- **jsonwebtoken** - JWT tokens
- **cookie-parser** - Cookie handling
- **express-session** - Session management (optional)

**Rationale:**
- googleapis: Official Google SDK, handles OAuth flow
- JWT: Stateless auth, works with frontend
- cookie-parser: Parse cookies in requests
- express-session: Alternative session-based auth

#### Validation
- **Zod** - Schema validation (shared with frontend)

**Rationale:**
- Share validation schemas between frontend/backend
- TypeScript inference
- Better DX than Joi or Yup

#### Database
- **MongoDB 7+** - NoSQL database
- **Mongoose 8+** - ODM (Object Data Modeling)
- **MongoDB Atlas** - Managed hosting (free tier)

**Rationale:**
- MongoDB: Flexible schema, good for rapid iteration
- Mongoose: Schema validation, middleware, plugins
- Atlas: Free 512MB, automatic backups, easy setup

#### LLM & AI
- **LangGraph (TypeScript SDK)** - AI workflow orchestration
- **Ollama** (dev) - Local LLM runtime
- **OpenAI SDK** (prod) - Cloud LLM API
- **groq-sdk** (prod alternative) - Fast inference

**Rationale:**
- LangGraph: Purpose-built for AI pipelines, state management
- Ollama: Free local dev, privacy-friendly
- OpenAI: Reliable, high quality, affordable (gpt-4o-mini)
- Groq: Very fast, generous free tier

#### Gmail Integration
- **googleapis** - Gmail API client
- OAuth 2.0 with offline access

**Rationale:**
- Official SDK, well-maintained
- Supports all Gmail API features
- Handles token refresh automatically

#### Logging
- **Morgan** - HTTP request logger
- **Winston** or **Pino** - Application logger

**Rationale:**
- Morgan: Standard Express logging middleware
- Winston/Pino: Structured JSON logs (good for production)
- Multiple transport options (file, console, cloud)

#### Error Tracking (Optional)
- **Sentry** - Error monitoring (free tier)

**Rationale:**
- Catch production errors
- Stack traces, breadcrumbs, context
- Free tier: 5,000 events/month

#### Testing
- **Vitest** - Unit tests
- **Supertest** - API testing
- **@faker-js/faker** - Fake data generation

**Rationale:**
- Vitest: Vite-native, fast, Jest-compatible API
- Supertest: Test HTTP requests easily
- Faker: Generate realistic test data

#### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

**Rationale:**
- Enforce code style consistency
- Catch bugs early
- Automate formatting

---

### DevOps & Infrastructure

#### Version Control
- **Git** - Source control
- **GitHub** - Repository hosting

**Rationale:**
- Industry standard
- Free private repos
- GitHub Actions integration

#### CI/CD
- **GitHub Actions** - Automation
  - Daily cron job for email summarization
  - Deploy on push to main
  - Run tests on PRs

**Rationale:**
- Free for public repos, generous limits for private
- YAML-based config
- Native GitHub integration

#### Frontend Hosting
**Option A: GitHub Pages (Recommended)**
- Free for public repos
- Custom domain support
- Automatic SSL
- Deploy from Actions

**Option B: Netlify**
- Free tier: 100GB bandwidth/month
- Automatic deploys from Git
- Edge functions available
- Better preview deploys

**Rationale:**
- Both are free and reliable
- GitHub Pages: Simplest for GitHub repos
- Netlify: Better features (redirects, forms, functions)

#### Backend Hosting
**Option A: Render (Recommended)**
- Free tier: 750 hours/month
- Auto-deploy from Git
- Automatic HTTPS
- Sleep after 15min inactivity
- Easy environment variables

**Option B: Railway**
- Free tier: $5 credit/month
- Better free tier than Render
- No sleep (always on)
- Great DX

**Option C: Fly.io**
- Free tier: 3 VMs
- Global deployment
- More control (Dockerfile)

**Rationale:**
- Render: Easiest setup, good free tier
- Railway: More generous, but $5 credit runs out eventually
- Fly.io: More powerful, but complex setup

#### Database Hosting
- **MongoDB Atlas** - Managed MongoDB
  - Free M0 cluster: 512MB storage
  - Automatic backups
  - Global regions

**Rationale:**
- Official MongoDB hosting
- Generous free tier
- Easy to upgrade if needed

#### Environment Secrets
- **GitHub Secrets** - For Actions workflows
- **Hosting Platform Env Vars** - For backend (Render/Railway)

**Rationale:**
- Secure secret storage
- No secrets in code
- Easy to rotate

---

### Notifications

#### Telegram
- **node-telegram-bot-api** - Telegram Bot SDK

**Rationale:**
- Popular messenger
- Easy webhook setup
- Rich formatting support

#### Discord
- **Native HTTPS** - Discord webhooks (no SDK needed)

**Rationale:**
- Simple webhook POST requests
- No authentication needed
- Rich embeds

---

### Development Tools

#### Package Manager
- **npm** (default) or **pnpm** (faster)

**Rationale:**
- npm: Built into Node.js, universal
- pnpm: Faster, disk-efficient, strict

#### Code Editor
- **VS Code** - Recommended IDE
  - Extensions: ESLint, Prettier, TypeScript, Tailwind CSS IntelliSense

**Rationale:**
- Best TypeScript support
- Huge extension ecosystem
- Free and fast

#### API Testing
- **Postman** or **Thunder Client** (VS Code)
- **curl** - Command line

**Rationale:**
- Test API endpoints during development
- Save request collections

#### Database GUI
- **MongoDB Compass** - Official GUI
- **Studio 3T** - Advanced features

**Rationale:**
- Visualize data during development
- Run queries, manage indexes

---

## 🗂️ Project Structure

### Monorepo or Separate Repos?

**Recommendation: Monorepo** (single repo with frontend + backend)

**Structure:**
```
mailmind/
├── .github/
│   └── workflows/
│       └── daily-summary.yml    # Cron job
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/                      # Optional: shared types
│   └── types/
├── docs/
│   ├── 01-project-scope.md
│   ├── 02-feature-list.md
│   ├── 03-architecture.md
│   └── 04-tech-stack.md
├── .gitignore
├── README.md
└── roadmap.txt
```

**Benefits:**
- Single clone, single PR review
- Share TypeScript types between frontend/backend
- Unified versioning and releases
- Easier to maintain

---

## 📦 Package.json Scripts (Backend)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 📦 Package.json Scripts (Frontend)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

---

## 🔧 Environment Variables

### Backend (.env)

```bash
# Server
PORT=3000
NODE_ENV=development
WEB_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mailmind

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT
JWT_SECRET=your-random-secret-256-bits

# LLM
LLM_PROVIDER=ollama                        # ollama | openai | groq | openrouter
OLLAMA_BASE_URL=http://localhost:11434     # Only for local dev
OPENAI_API_KEY=sk-...                      # Only if using OpenAI
GROQ_API_KEY=gsk_...                       # Only if using Groq

# Tasks
TASKS_SECRET=your-secret-for-cron-jobs

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MailMind
```

---

## 🚀 Quick Start Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Run Ollama (Local LLM)
```bash
# Install Ollama from https://ollama.ai
ollama serve
ollama pull llama3.1:8b
```

### Database Setup
1. Create free MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

---

## 📊 Dependencies Overview

### Backend (package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6",
    "express-validator": "^7.0.1",
    "googleapis": "^131.0.0",
    "mongoose": "^8.1.0",
    "zod": "^3.22.4",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "langgraph": "^0.0.20",
    "openai": "^4.24.1",
    "groq-sdk": "^0.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "ts-node-dev": "^2.0.0",
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/morgan": "^1.9.9",
    "vitest": "^1.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.21.1",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.11",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "vitest": "^1.1.0"
  }
}
```

---

## 🎯 Why This Stack?

### Design Principles

1. **Free-First:** Everything runs on free tiers
2. **Type-Safe:** TypeScript everywhere
3. **Modern:** Latest stable versions
4. **Minimal:** Avoid over-engineering
5. **Productive:** Fast development cycles
6. **Maintainable:** Clean architecture, testable code
7. **Scalable:** Can grow with user base

### Trade-offs Made

| Decision | Pro | Con |
|----------|-----|-----|
| MongoDB vs PostgreSQL | Flexible schema, faster iteration | No relational queries |
| Express vs Fastify | Huge ecosystem, more tutorials | Slightly slower |
| Ollama vs Cloud LLM | Free, private | Requires local setup |
| Monorepo vs Multi-repo | Easier to maintain | Larger repository |
| GitHub Pages vs Vercel | Simple, free | Less features |
| GitHub Actions vs Cron | Free, reliable | Not real-time |

---

## 🔄 Upgrade Path (Post-MVP)

### If scaling is needed:
- **Frontend:** Migrate to Next.js (SSR, API routes)
- **Backend:** Add Redis for caching, BullMQ for queues
- **Database:** Upgrade MongoDB tier, add read replicas
- **LLM:** Implement request caching, batch processing
- **Hosting:** Upgrade to paid tiers or move to AWS/GCP

---

**Last Updated:** October 30, 2025
