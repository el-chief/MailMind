# 🎯 MailMind — Feature List

**Version:** 1.0  
**Date:** October 30, 2025

---

## 🚀 MVP Features (Must-Have)

### 1. Authentication & User Management

#### 1.1 Google OAuth Integration
- **Priority:** P0 (Critical)
- **Description:** Secure user authentication via Google OAuth2
- **Acceptance Criteria:**
  - User can sign in with Google account
  - OAuth grants read-only Gmail access
  - Refresh tokens stored securely
  - Session persists across visits
- **Technical Notes:** Use `googleapis` npm package, store tokens in MongoDB

#### 1.2 User Profile
- **Priority:** P1 (High)
- **Description:** Basic user profile management
- **Acceptance Criteria:**
  - Display user's name and email
  - Show connected Gmail account
  - Ability to disconnect/logout
  - View account creation date

---

### 2. Email Fetching & Processing

#### 2.1 Gmail API Integration
- **Priority:** P0 (Critical)
- **Description:** Fetch emails from user's Gmail inbox
- **Acceptance Criteria:**
  - Fetch emails from last 24 hours
  - Handle pagination for large inboxes
  - Filter out spam and trash
  - Extract: subject, sender, body, date, attachments list
- **Technical Notes:** Use Gmail API `messages.list` and `messages.get`

#### 2.2 Email Preprocessing
- **Priority:** P0 (Critical)
- **Description:** Clean and prepare emails for summarization
- **Acceptance Criteria:**
  - Strip HTML tags, keep readable text
  - Handle multipart MIME messages
  - Extract plain text from base64 encoding
  - Preserve links and important formatting
  - Truncate very long emails (>10,000 chars)
- **Technical Notes:** LangGraph preprocessing node

---

### 3. AI Summarization Engine

#### 3.1 LangGraph Workflow
- **Priority:** P0 (Critical)
- **Description:** Orchestrate email processing pipeline
- **Acceptance Criteria:**
  - Nodes: fetch → preprocess → summarize → structure → store → notify
  - Handle errors gracefully (skip bad emails)
  - Log workflow execution
  - Support multiple LLM providers
- **Technical Notes:** LangGraph state machine with checkpointing

#### 3.2 LLM Integration
- **Priority:** P0 (Critical)
- **Description:** Connect to AI models for summarization
- **Acceptance Criteria:**
  - Support Ollama (local development)
  - Support OpenAI API (production)
  - Support OpenRouter, Groq, Together.ai
  - Configurable via environment variables
  - Fallback mechanism if primary LLM fails
- **Technical Notes:** Abstract LLM provider interface

#### 3.3 Summary Generation
- **Priority:** P0 (Critical)
- **Description:** Generate concise email summaries
- **Acceptance Criteria:**
  - Summary includes: sender, subject, key points (2-3 bullets), date
  - Identify action items if present
  - Extract sentiment (neutral, urgent, promotional)
  - Auto-generate tags (work, personal, newsletter, etc.)
  - Max summary length: 200 words
- **Prompt Engineering:** Use structured prompts with examples

#### 3.4 Batch Processing
- **Priority:** P1 (High)
- **Description:** Efficiently process multiple emails
- **Acceptance Criteria:**
  - Process up to 100 emails in single run
  - Parallel processing where possible
  - Progress tracking
  - Resume from failure point
- **Technical Notes:** Use Promise.all with concurrency limit

---

### 4. Data Storage & Management

#### 4.1 MongoDB Integration
- **Priority:** P0 (Critical)
- **Description:** Store user data and summaries
- **Collections:**
  - `users`: User profiles and OAuth tokens
  - `summaries`: Daily email summaries
  - `runs`: Execution logs (optional)
- **Indexes:**
  - `summaries`: Unique index on `userId + emailId`
  - `summaries`: Index on `userId + date` for fast queries

#### 4.2 Summary Storage
- **Priority:** P0 (Critical)
- **Description:** Persist generated summaries
- **Schema:**
  ```javascript
  {
    userId: ObjectId,
    emailId: String (Gmail message ID),
    sender: { name: String, email: String },
    subject: String,
    summary: String,
    keyPoints: [String],
    tags: [String],
    sentiment: String,
    hasAttachments: Boolean,
    receivedAt: Date,
    summarizedAt: Date,
    llmProvider: String
  }
  ```

#### 4.3 Data Retention
- **Priority:** P2 (Nice to have)
- **Description:** Manage old summaries
- **Acceptance Criteria:**
  - Keep summaries for 90 days by default
  - User can configure retention period
  - Automatic cleanup job (monthly)

---

### 5. Daily Automation

#### 5.1 GitHub Actions Scheduler
- **Priority:** P0 (Critical)
- **Description:** Trigger daily summarization automatically
- **Acceptance Criteria:**
  - Cron job runs once daily (e.g., 8 AM user's timezone)
  - Calls backend `/api/tasks/runDaily` endpoint
  - Protected by secret token
  - Logs execution results
  - Sends failure alerts
- **Technical Notes:** `.github/workflows/daily-summary.yml`

#### 5.2 Task Endpoint
- **Priority:** P0 (Critical)
- **Description:** Backend endpoint for scheduled tasks
- **Acceptance Criteria:**
  - Validates secret token
  - Processes all active users
  - Returns execution summary
  - Handles timeouts gracefully
- **Route:** `POST /api/tasks/runDaily`

---

### 6. Web Dashboard (Frontend)

#### 6.1 Today's Summary View
- **Priority:** P0 (Critical)
- **Description:** Display current day's email summaries
- **Acceptance Criteria:**
  - Show all summaries from last 24 hours
  - Group by sender or time
  - Display key points prominently
  - Show tags and sentiment badges
  - Click to see original email (link to Gmail)
- **UI Notes:** Card-based layout, infinite scroll

#### 6.2 Historical View
- **Priority:** P1 (High)
- **Description:** Browse previous days' summaries
- **Acceptance Criteria:**
  - Calendar picker or date range selector
  - Load summaries for selected date
  - Performance: Load within 1 second
- **UI Notes:** Lazy loading

#### 6.3 Search & Filter
- **Priority:** P1 (High)
- **Description:** Find specific summaries
- **Acceptance Criteria:**
  - Search by sender, subject, or keywords
  - Filter by tags (work, personal, etc.)
  - Filter by sentiment
  - Filter by date range
- **Technical Notes:** Backend API search endpoint

#### 6.4 Dashboard Stats
- **Priority:** P2 (Nice to have)
- **Description:** Overview metrics
- **Acceptance Criteria:**
  - Total emails summarized today
  - Most frequent senders
  - Tag breakdown (pie chart)
  - Weekly trend graph
- **UI Notes:** Simple charts with Chart.js or Recharts

#### 6.5 Settings Page
- **Priority:** P1 (High)
- **Description:** User preferences
- **Acceptance Criteria:**
  - Toggle notifications on/off
  - Select notification channel (Telegram/Discord)
  - Configure summarization frequency
  - Manage connected accounts
  - Delete all data option
- **UI Notes:** Form-based settings

#### 6.6 Theme Support
- **Priority:** P2 (Nice to have)
- **Description:** Dark/light mode
- **Acceptance Criteria:**
  - Toggle between dark and light themes
  - Persist preference in localStorage
  - Auto-detect system preference
- **Technical Notes:** CSS variables or Tailwind dark mode

---

### 7. Notifications

#### 7.1 Telegram Bot
- **Priority:** P1 (High)
- **Description:** Send daily summaries via Telegram
- **Acceptance Criteria:**
  - User provides bot token and chat ID
  - Receive daily digest message
  - Include top 5 important emails
  - Format with Markdown
  - Handle errors gracefully
- **Technical Notes:** Use `node-telegram-bot-api`

#### 7.2 Discord Webhook
- **Priority:** P1 (High)
- **Description:** Send summaries to Discord channel
- **Acceptance Criteria:**
  - User provides webhook URL
  - Send daily digest embed
  - Color-code by sentiment
  - Include summary link
- **Technical Notes:** Simple HTTPS POST request

---

### 8. API Endpoints

#### Backend API (Express)

##### Authentication
- `POST /api/auth/google` - Initiate OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

##### Summaries
- `GET /api/summaries` - Get summaries (with date filters)
- `GET /api/summaries/:id` - Get single summary
- `DELETE /api/summaries/:id` - Delete summary
- `GET /api/summaries/search` - Search summaries

##### Tasks (Protected)
- `POST /api/tasks/runDaily` - Trigger daily summarization
- `POST /api/tasks/runNow` - Manual trigger (dev only)

##### User Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `DELETE /api/user` - Delete account and all data

##### Health
- `GET /api/health` - Health check endpoint

---

## 🔮 Post-MVP Features (Future)

### Phase 6: Enhancements

#### Smart Classification
- **Priority:** P2
- **Description:** Automatically categorize emails
- **Features:**
  - ML-based classification (work, personal, newsletters, receipts)
  - Learn from user feedback
  - Custom categories

#### Priority Sender Detection
- **Priority:** P2
- **Description:** Identify VIP senders
- **Features:**
  - Track reply frequency
  - User can mark priority contacts
  - Highlight priority emails in dashboard

#### Voice Summary
- **Priority:** P3
- **Description:** Audio daily briefing
- **Features:**
  - Text-to-speech integration
  - "Good morning, you have 12 emails..."
  - Playback controls in dashboard

#### Notion Integration
- **Priority:** P2
- **Description:** Sync summaries to Notion
- **Features:**
  - Create daily summary pages
  - Link to Notion database
  - Bi-directional sync

#### Multi-Account Support
- **Priority:** P2
- **Description:** Handle multiple Gmail accounts
- **Features:**
  - Switch between accounts
  - Unified or separate dashboards
  - Account-specific settings

---

### Phase 7+: Advanced Ideas

#### Browser Extension
- **Priority:** P3
- In-Gmail summary display
- One-click summarization
- Chrome, Firefox, Edge support

#### Desktop App
- **Priority:** P3
- Electron-based native app
- Offline mode
- System tray notifications

#### GitHub MCP Integration
- **Priority:** P3
- Summarize GitHub notifications
- PR reviews, issues, mentions
- Developer-focused summaries

#### Mobile Apps
- **Priority:** P3
- Native iOS and Android apps
- Push notifications
- On-the-go access

#### Advanced Analytics
- **Priority:** P3
- Email pattern analysis
- Response time tracking
- Productivity insights

#### Multi-Provider Support
- **Priority:** P2
- Outlook/Office 365
- Yahoo Mail
- ProtonMail
- IMAP/POP3 generic support

#### Team Features
- **Priority:** P3
- Shared summaries
- Team dashboards
- Collaboration tools

---

## 🎯 Feature Priority Legend

- **P0 (Critical):** Must-have for MVP, blocks launch
- **P1 (High):** Important for good UX, include if time permits
- **P2 (Medium):** Nice to have, adds value but not essential
- **P3 (Low):** Future enhancement, can defer to later phases

---

## 📊 MVP Feature Completion Checklist

- [ ] Google OAuth authentication
- [ ] Gmail API integration
- [ ] Email fetching and preprocessing
- [ ] LangGraph workflow setup
- [ ] LLM integration (Ollama + OpenAI)
- [ ] Summary generation
- [ ] MongoDB storage
- [ ] Daily automation (GitHub Actions)
- [ ] Web dashboard (Today's view)
- [ ] Historical summaries view
- [ ] Search and filter
- [ ] Settings page
- [ ] Telegram/Discord notifications
- [ ] Deployment (Render + GitHub Pages)
- [ ] Error handling and logging

---

**Last Updated:** October 30, 2025
