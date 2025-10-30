# 🤖 Scheduled Automation - Setup Guide

## Overview

MailMind now has **automated daily email summarization** using GitHub Actions! This runs automatically every day to:
- ✅ Fetch new emails from Gmail for all connected users
- ✅ Summarize emails using AI (Gemini 2.0 Flash)
- ✅ Store summaries in MongoDB
- ✅ Skip already-summarized emails
- ✅ Handle rate limits and errors gracefully

---

## 🚀 How It Works

### Automated Flow

```
Daily at 8:00 AM UTC
     ↓
GitHub Actions triggers workflow
     ↓
For each user with Gmail connected:
  - Fetch latest 20 emails
  - Filter out already-summarized emails
  - Summarize new emails with AI
  - Store in MongoDB
  - Wait 4 seconds between requests (rate limiting)
     ↓
Generate summary report
     ↓
Done! ✅
```

---

## ⚙️ Setup Instructions

### Step 1: Push to GitHub

First, push your code to GitHub:

```bash
cd d:\Projects\Startup\MailMind

# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Add automated email summarization"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/mailmind.git

# Push
git push -u origin main
```

### Step 2: Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

1. **MONGODB_URI**
   ```
   
   ```

2. **GOOGLE_CLIENT_ID**
   ```
  
   ```

3. **GOOGLE_CLIENT_SECRET**
   ```
   
   ```

4. **GOOGLE_REDIRECT_URI**
   ```
   http://localhost:5000/api/gmail/callback
   ```

5. **GEMINI_API_KEY**
   ```
  
   ```

### Step 3: Enable GitHub Actions

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Click **"I understand my workflows, go ahead and enable them"** (if prompted)

### Step 4: Wait or Trigger Manually

**Option A: Wait for automatic run**
- The workflow runs automatically every day at 8:00 AM UTC
- You'll see it appear in the Actions tab

**Option B: Trigger manually (for testing)**
1. Go to **Actions** tab
2. Click **"Daily Email Summarization"** in the left sidebar
3. Click **"Run workflow"** button (top right)
4. (Optional) Enter a specific user ID to test
5. Click **"Run workflow"** to start

---

## 🧪 Test Locally First

Before relying on GitHub Actions, test the script locally:

```bash
cd backend

# Test with all users
npm run summarize

# Test with specific user
USER_ID=6903e9d43b6d7206ca240786 npm run summarize

# Test with custom max emails
MAX_EMAILS=10 npm run summarize
```

**Expected output:**
```
🚀 MailMind - Daily Email Summarization
========================================

📅 Date: 2025-10-31T...
🔑 Environment: development

🔌 Connecting to MongoDB...
✅ MongoDB connected

👥 Finding all users with Gmail connected...
Found 1 user(s) to process

[1/1] Processing user: 6903e9d43b6d7206ca240786
────────────────────────────────────────────────────────────
  📥 Fetching up to 20 emails...
  🤖 Summarizing 5 new emails with AI...
    ✓ [1/5] Important: Project deadline update...
    ✓ [2/5] Meeting reminder: Q4 planning...
    ✓ [3/5] Your weekly newsletter...
    ✓ [4/5] Action required: Review document...
    ✓ [5/5] Follow-up: Yesterday's discussion...

📊 Summary Report
========================================

👤 your@email.com
   📥 Fetched: 10
   ✅ Summarized: 5
   ⏭️  Skipped: 5
   ❌ Failed: 0

────────────────────────────────────────────────────────────
📊 Total Users Processed: 1
📥 Total Emails Fetched: 10
✅ Total Summarized: 5
⏭️  Total Skipped: 5
❌ Total Failed: 0

🎉 Daily summarization completed successfully!

🔌 Disconnecting from MongoDB...
✅ Disconnected

✨ Script completed
```

---

## 📅 Schedule Customization

### Change the Daily Time

Edit `.github/workflows/daily-email-summary.yml`:

```yaml
schedule:
  # Change this cron expression
  - cron: '0 8 * * *'  # 8:00 AM UTC
```

**Common schedules:**
- `'0 8 * * *'` - 8:00 AM UTC daily
- `'0 0 * * *'` - Midnight UTC daily
- `'0 9 * * 1-5'` - 9:00 AM UTC, Monday-Friday only
- `'0 */6 * * *'` - Every 6 hours
- `'30 7 * * *'` - 7:30 AM UTC daily

**Convert UTC to your timezone:**
- UTC 8:00 AM = 1:30 PM IST (India)
- UTC 8:00 AM = 4:00 AM EST (US East)
- UTC 8:00 AM = 1:00 AM PST (US West)

Use: https://www.worldtimebuddy.com/

### Change Max Emails per User

Edit the workflow file:

```yaml
env:
  MAX_EMAILS: ${{ github.event.inputs.maxEmails || '20' }}
```

Change `'20'` to your desired number (e.g., `'50'`, `'100'`).

---

## 🔍 Monitoring & Logs

### View Logs in GitHub

1. Go to **Actions** tab
2. Click on the workflow run
3. Click on the job (e.g., "summarize-emails")
4. Expand steps to see detailed logs

### Check for Errors

Look for these in the logs:
- ✅ Green checkmarks = Success
- ❌ Red X = Failure
- ⚠️ Yellow warning = Partial success

### Email Notifications

GitHub automatically emails you if a workflow fails. Check your GitHub notification settings.

---

## 🛠️ Troubleshooting

### Workflow Not Running

**Problem:** Workflow doesn't trigger at scheduled time.

**Solutions:**
1. Check if Actions are enabled (Settings → Actions)
2. Verify the cron schedule is correct
3. GitHub may delay up to 15 minutes during high load
4. Make sure the workflow file is on the `main` branch

### Authentication Errors

**Problem:** `Gmail not connected` or `User not found`.

**Solutions:**
1. Verify users have completed Gmail OAuth
2. Check MONGODB_URI secret is correct
3. Ensure tokens haven't expired (should auto-refresh)

### Rate Limit Errors

**Problem:** `Quota exceeded` or `Rate limit` errors.

**Solutions:**
1. Reduce MAX_EMAILS (default: 20)
2. Increase delay between requests (edit script)
3. Check Gemini API quota limits
4. Space out users (wait 5 seconds between users)

### API Key Errors

**Problem:** `GEMINI_API_KEY is not set` or `Invalid API key`.

**Solutions:**
1. Check secret name is exactly `GEMINI_API_KEY`
2. Verify API key is valid (test locally first)
3. Regenerate API key from Google AI Studio
4. Check API key hasn't expired

---

## 📊 Performance & Costs

### GitHub Actions Usage

**Free tier includes:**
- 2,000 minutes/month for private repos
- Unlimited for public repos

**This workflow uses:**
- ~2-5 minutes per run (depends on email count)
- Running daily = ~60-150 minutes/month
- **Well within free tier!** ✅

### Gemini API Usage

**Free tier includes:**
- 15 requests/minute
- 1,500 requests/day

**This workflow:**
- Processes 20 emails/user by default
- With delays: ~3 minutes per 20 emails
- **Stays within free tier!** ✅

---

## 🎯 Advanced Configuration

### Process Specific Users Only

Edit `daily-summarize.ts` to filter users:

```typescript
// Only process users with specific email domains
const tokens = await GmailToken.find({});
const users = await User.find({
  _id: { $in: tokens.map(t => t.userId) },
  email: { $regex: /@company.com$/i }
});
usersToProcess = users.map(u => u._id.toString());
```

### Add Notification on Completion

After the summarization completes, send a notification:

```typescript
// At the end of main()
if (totalSummarized > 0) {
  await sendTelegramNotification(`✅ Summarized ${totalSummarized} emails`);
}
```

### Save Report to File

Add this before disconnecting:

```typescript
import fs from 'fs';

const report = {
  date: new Date().toISOString(),
  users: results.length,
  summarized: totalSummarized,
  failed: totalFailed
};

fs.writeFileSync('report.json', JSON.stringify(report, null, 2));
```

---

## ✅ Setup Checklist

- [ ] Code pushed to GitHub
- [ ] All secrets added to repository
- [ ] GitHub Actions enabled
- [ ] Script tested locally first
- [ ] Workflow triggered manually (test run)
- [ ] Verified logs show success
- [ ] Checked summaries in database
- [ ] Set preferred schedule time
- [ ] Configured max emails per user

---

## 🎉 What's Next

Now that automation is set up, you can:

1. **Let it run** - Check back daily to see new summaries
2. **Build frontend** - Dashboard to view summaries
3. **Add notifications** - Telegram/Discord daily digest
4. **Monitor performance** - Track success/failure rates
5. **Scale up** - Add more users, adjust limits

---

## 📚 Files Created

1. `.github/workflows/daily-email-summary.yml` - GitHub Actions workflow
2. `backend/src/scripts/daily-summarize.ts` - Automation script
3. `backend/AUTOMATION-SETUP.md` - This guide!

---

## 🆘 Need Help?

1. **Test locally first:** `npm run summarize`
2. **Check GitHub Actions logs** for errors
3. **Verify all secrets** are set correctly
4. **Review terminal output** for specific errors

---

**Your automated email summarization is ready! 🚀**

The system will now process emails daily without any manual intervention.
