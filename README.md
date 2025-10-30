# 🧠 MailMind

> Your personal AI that reads, summarizes, and organizes your emails daily — privately and for free.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)

---

## 🎯 What is MailMind?

MailMind is an intelligent email assistant that automatically:
- 📧 Connects to your Gmail account securely
- 🤖 Summarizes your emails daily using AI
- 📊 Presents clean, searchable summaries in a dashboard
- 🔔 Sends optional daily digests via Telegram/Discord
- 🔒 Keeps your data private (local AI option available)

**Best part?** It's 100% free to use and runs on free-tier infrastructure.

---

## ✨ Key Features

### MVP (Currently Planned)
- ✅ **Gmail Integration** - OAuth2 read-only access
- ✅ **AI Summarization** - LangGraph workflow with local (Ollama) or cloud LLMs
- ✅ **Smart Storage** - MongoDB Atlas for summaries and user data
- ✅ **Daily Automation** - GitHub Actions cron job
- ✅ **Web Dashboard** - React + TypeScript with search and filters
- ✅ **Notifications** - Telegram bot and Discord webhook support

### Coming Soon (Post-MVP)
- 🎯 Smart email classification (work, personal, newsletters)
- 👤 Priority sender detection
- 🔊 Voice-based daily briefing
- 📝 Notion integration
- 👥 Multi-account support

---

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (Node.js + Express) ←→ Gmail API
                           ↓
                    LangGraph Pipeline
                           ↓
                    LLM (Ollama/OpenAI)
                           ↓
                    MongoDB Atlas
                           ↓
                    Notifications (Telegram/Discord)
```

**Technology Stack:**
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js 20, Express, TypeScript, LangGraph
- **Database:** MongoDB Atlas (free tier)
- **AI:** Ollama (local) or OpenAI/Groq (cloud)
- **Automation:** GitHub Actions
- **Hosting:** Render (backend), GitHub Pages (frontend)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Project Scope](docs/01-project-scope.md) | What MailMind will and won't do |
| [Feature List](docs/02-feature-list.md) | Complete feature breakdown with priorities |
| [Architecture](docs/03-architecture.md) | System design and component details |
| [Tech Stack](docs/04-tech-stack.md) | Technology choices and rationale |
| [Roadmap](roadmap.txt) | Development phases and timeline |

---

## 🚀 Quick Start (Coming Soon)

### Prerequisites
- Node.js 20+
- npm or pnpm
- MongoDB Atlas account (free)
- Google Cloud Console project (free)
- Ollama (for local LLM) or OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mailmind.git
cd mailmind

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Install frontend dependencies
cd ../frontend
npm install

# Start development servers
npm run dev
```

---

## 🛣️ Development Roadmap

| Phase | Status | Duration | Description |
|-------|--------|----------|-------------|
| **Phase 1** | ✅ Complete | 1 day | Foundation & Planning |
| **Phase 2** | 🔄 Next | 1 week | Backend Core (Data Pipeline) |
| **Phase 3** | 📋 Planned | 3-5 days | Frontend (Dashboard) |
| **Phase 4** | 📋 Planned | 2-3 days | Notifications & Integrations |
| **Phase 5** | 📋 Planned | 2-3 days | Deployment & Hosting |
| **Phase 6** | 📋 Planned | Continuous | Post-Deployment Enhancements |
| **Phase 7** | 📋 Planned | Ongoing | Maintenance & Scaling |

**Current Status:** Phase 1 complete! Starting Phase 2 (Backend Core)

[View Detailed Roadmap](roadmap.txt)

---

## 📁 Project Structure

```
mailmind/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
├── docs/              # Documentation
│   ├── 01-project-scope.md
│   ├── 02-feature-list.md
│   ├── 03-architecture.md
│   └── 04-tech-stack.md
├── .github/
│   └── workflows/     # GitHub Actions (daily cron)
└── README.md
```

---

## 🔒 Privacy & Security

- **Read-Only Access:** Gmail OAuth with read-only scope only
- **Local AI Option:** Use Ollama to keep emails on your machine
- **Encrypted Storage:** OAuth tokens encrypted at rest
- **Data Minimization:** Only store summaries, not full email content
- **User Control:** Delete your data anytime
- **No Tracking:** No analytics, no third-party tracking

---

## 🤝 Contributing

MailMind is currently in active development (Phase 1 complete). Contributions are welcome!

**How to contribute:**
1. Check out the [Feature List](docs/02-feature-list.md) for planned features
2. Look for issues tagged `good first issue` or `help wanted`
3. Fork the repo and create a feature branch
4. Make your changes with tests
5. Submit a pull request

**Code of Conduct:** Be respectful, collaborative, and constructive.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangGraph** - AI workflow orchestration
- **Ollama** - Local LLM runtime
- **Express** - Web framework
- **React** - UI library
- **MongoDB** - Database

---

## 📧 Contact

- **Issues:** [GitHub Issues](https://github.com/yourusername/mailmind/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/mailmind/discussions)
- **Email:** your.email@example.com (for security issues only)

---

## 🌟 Star History

If you find MailMind useful, please consider giving it a star! ⭐

---

## 📊 Status

**Current Version:** 0.1.0-alpha (Phase 1)  
**Last Updated:** October 30, 2025  
**Status:** 🔄 Active Development

---

## 💡 Inspiration

Built for people who:
- Receive too many emails daily (50-200+)
- Struggle to prioritize important messages
- Want AI-powered organization without giving up privacy
- Need a free, self-hostable solution

---

**Made with ❤️ and ☕**

---

## 🗺️ Next Steps

- [x] Phase 1: Planning complete
- [ ] Phase 2: Backend core development
- [ ] Phase 3: Frontend dashboard
- [ ] Phase 4: Notifications
- [ ] Phase 5: Production deployment

**Want to follow along?** Watch this repo for updates!
