# MailMind Deployment & Monitoring Guide

## 🚀 Quick Deploy

### Option 1: Railway (Recommended - Easiest)

Railway is perfect for Node.js apps with:
- ✅ Free tier (500 hours/month, $5 credit)
- ✅ Automatic HTTPS
- ✅ GitHub integration
- ✅ Environment variables management
- ✅ Built-in monitoring

**Steps:**

1. **Create Railway Account**
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `mailmind` repository
   - Select `main` branch

3. **Configure Build**
   - Root directory: `/`
   - Build command: `cd backend && npm ci && npm run build`
   - Start command: `cd backend && npm start`
   - Or let Railway auto-detect (it will use `railway.toml`)

4. **Add Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add all secrets:
     ```
     MONGODB_URI=mongodb+srv://...
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/gmail/callback
     GEMINI_API_KEY=...
     NODE_ENV=production
     ```

5. **Deploy!**
   - Railway automatically deploys
   - Get your URL: `https://your-app.railway.app`
   - Update `GOOGLE_REDIRECT_URI` in Google Console

6. **Enable Auto-Deploy**
   - Settings → Enable "Auto Deploy"
   - Now every push to `main` auto-deploys

---

### Option 2: Render

Render offers:
- ✅ Free tier (750 hours/month)
- ✅ Automatic HTTPS
- ✅ GitHub integration

**Steps:**

1. Go to: https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect GitHub repo
5. Configure:
   - Name: `mailmind-backend`
   - Root directory: `backend`
   - Build command: `npm ci && npm run build`
   - Start command: `npm start`
6. Add environment variables (same as above)
7. Create Web Service

---

### Option 3: Vercel

Vercel is great for serverless:
- ✅ Free tier (generous)
- ✅ Edge network
- ✅ Zero config

**Steps:**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd backend
   vercel
   ```

3. Follow prompts and add env vars

---

### Option 4: Docker (Self-hosted/VPS)

Deploy anywhere with Docker:

**Build & Run:**
```bash
# Build
docker build -t mailmind-backend .

# Run
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI="..." \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e GOOGLE_REDIRECT_URI="..." \
  -e GEMINI_API_KEY="..." \
  --name mailmind \
  mailmind-backend
```

**Or use Docker Compose:**
```bash
# Create .env file with all variables
docker-compose up -d
```

---

## 📊 Monitoring

### 1. Health Endpoints

Your app has these health check endpoints:

```bash
# Basic health check
GET /health

# Detailed health (database, stats)
GET /health/detailed

# Readiness probe (for orchestrators)
GET /health/ready

# Liveness probe
GET /health/live

# System metrics
GET /health/metrics
```

**Test locally:**
```bash
curl http://localhost:5000/health/detailed
```

**Test production:**
```bash
curl https://your-app.railway.app/health/detailed
```

---

### 2. GitHub Actions Monitoring

**Automated hourly health checks:**
- `.github/workflows/health-check.yml` runs every hour
- Checks `/health` endpoint
- Alerts on failure
- View in Actions tab

**To enable:**
1. Add `APP_URL` secret to GitHub:
   - Settings → Secrets → Actions
   - Name: `APP_URL`
   - Value: `https://your-app.railway.app`

2. Workflow will automatically check health every hour

---

### 3. Railway Built-in Monitoring

Railway provides:
- **Metrics Dashboard**
  - CPU usage
  - Memory usage
  - Network traffic
  - Response times

- **Logs**
  - Real-time logs
  - Filter by level
  - Download logs

- **Deployments**
  - Deployment history
  - Rollback to previous version
  - Deploy status

**Access:**
- Project → Your Service → Metrics/Logs tabs

---

### 4. UptimeRobot (Free External Monitoring)

Get alerts when your app goes down:

**Setup:**
1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://your-app.railway.app/health`
   - Interval: 5 minutes
4. Add alert contacts (email, SMS, Telegram)

**You'll get:**
- ✅ 99.9% uptime tracking
- ✅ Email/SMS alerts on downtime
- ✅ Public status page
- ✅ Response time graphs

---

### 5. Error Tracking with Sentry (Optional)

Free error monitoring:

**Setup:**
1. Go to: https://sentry.io
2. Create project (Node.js/Express)
3. Install:
   ```bash
   npm install @sentry/node
   ```

4. Add to `src/index.ts`:
   ```typescript
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

5. Add error handler to `app.ts`:
   ```typescript
   app.use(Sentry.Handlers.errorHandler());
   ```

**You'll get:**
- ✅ Error tracking & alerts
- ✅ Stack traces
- ✅ User context
- ✅ Performance monitoring

---

### 6. Logs Management

**Railway Logs:**
- View in Railway dashboard
- Filter by severity
- Download logs

**Production Logging:**

Add Winston for structured logs:
```bash
npm install winston
```

Create `src/utils/logger.ts`:
```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

Use in code:
```typescript
logger.info('Email summarized', { userId, emailId });
logger.error('Failed to summarize', { error: err.message });
```

---

## 🔔 Notifications

### Telegram Notifications

**Setup Telegram Bot:**
1. Message `@BotFather` on Telegram
2. Create bot: `/newbot`
3. Get bot token
4. Get your chat ID: Message `@userinfobot`

**Add to GitHub Secrets:**
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

**Add to workflow** (`.github/workflows/health-check.yml`):
```yaml
- name: Send Telegram Alert
  if: failure()
  run: |
    curl -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
      -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
      -d "text=🚨 MailMind Health Check Failed!%0A%0ATime: $(date)%0ACheck logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

---

### Discord Notifications

**Setup Discord Webhook:**
1. Go to Discord server settings
2. Integrations → Webhooks
3. Create webhook
4. Copy webhook URL

**Add to GitHub Secrets:**
- `DISCORD_WEBHOOK_URL`

**Add to workflow:**
```yaml
- name: Send Discord Alert
  if: failure()
  run: |
    curl -X POST "${{ secrets.DISCORD_WEBHOOK_URL }}" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "🚨 **MailMind Health Check Failed!**",
        "embeds": [{
          "title": "System Status",
          "description": "Health check endpoint returned an error",
          "color": 15158332,
          "fields": [
            {
              "name": "Time",
              "value": "'"$(date)"'"
            }
          ]
        }]
      }'
```

---

## 📈 Performance Monitoring

### Response Time Tracking

Your `/health/detailed` endpoint includes response time.

Monitor it with:
```bash
# Check response time
time curl https://your-app.railway.app/health/detailed
```

### Memory Usage

Check memory with `/health/metrics`:
```bash
curl https://your-app.railway.app/health/metrics | jq '.memory'
```

### Database Performance

Monitor MongoDB Atlas:
- Go to: https://cloud.mongodb.com
- Clusters → Your Cluster → Metrics
- View:
  - Operations/second
  - Connections
  - Network traffic
  - Storage usage

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] GOOGLE_REDIRECT_URI updated with production URL
- [ ] CORS_ORIGIN set to production frontend URL
- [ ] Health checks responding
- [ ] GitHub Actions secrets configured
- [ ] UptimeRobot monitor added
- [ ] Error tracking (Sentry) set up
- [ ] Logs readable and structured
- [ ] Backup strategy for MongoDB
- [ ] SSL certificate valid (automatic on Railway/Render)
- [ ] Rate limiting configured (if needed)
- [ ] Database indexes created
- [ ] Test daily automation workflow

---

## 🔧 Common Issues

### Issue: Health check fails

**Solution:**
1. Check logs for errors
2. Verify database connection
3. Ensure all env vars are set
4. Check PORT is correct (5000 or Railway auto-assigned)

### Issue: CORS errors

**Solution:**
1. Add frontend URL to CORS_ORIGIN env var
2. Ensure credentials: true in CORS config
3. Check allowedOrigins includes your domain

### Issue: OAuth redirect fails

**Solution:**
1. Update GOOGLE_REDIRECT_URI to production URL
2. Add production URL to Google Console authorized redirect URIs
3. Verify callback endpoint is accessible

### Issue: Daily automation not running

**Solution:**
1. Check GitHub Actions are enabled
2. Verify all secrets are set
3. Check cron schedule is correct
4. View workflow run logs for errors

---

## 📊 Monitoring Dashboard URLs

After deployment, bookmark these:

- **Railway Dashboard:** https://railway.app/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Actions:** https://github.com/YOUR_USERNAME/mailmind/actions
- **UptimeRobot:** https://uptimerobot.com/dashboard
- **Health Check:** https://your-app.railway.app/health/detailed
- **Metrics:** https://your-app.railway.app/health/metrics

---

## 🎉 You're Live!

Once deployed:
1. ✅ API accessible at your production URL
2. ✅ Health checks monitored hourly
3. ✅ Daily automation runs automatically
4. ✅ Errors tracked and alerted
5. ✅ Logs available for debugging

**Next:** Build frontend dashboard to visualize summaries! 🚀
