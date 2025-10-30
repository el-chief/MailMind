# 🤖 Google Gemini AI Setup Guide

## Overview

MailMind uses **Google Gemini 1.5 Flash** for AI-powered email summarization. Gemini is:
- ✅ **Free** with generous quotas (up to 15 requests/minute)
- ✅ **Fast** - Optimized for speed
- ✅ **Accurate** - High-quality summaries
- ✅ **Easy** to set up

---

## 🔑 Get Your Free Gemini API Key

### Step 1: Visit Google AI Studio

Go to: **https://makersuite.google.com/app/apikey**

Or: **https://aistudio.google.com/app/apikey**

### Step 2: Sign in with Google Account

Use the same Google account you want to use for development.

### Step 3: Create API Key

1. Click **"Get API Key"** or **"Create API Key"**
2. Choose **"Create API key in new project"** (recommended for clean setup)
   - Or select an existing Google Cloud project if you have one
3. Copy the generated API key
   - Format: `AIzaSy...` (39 characters)
   - **Important:** Save this key securely - you won't see it again!

### Step 4: Add to `.env` File

Open `backend/.env` and update:

```env
GEMINI_API_KEY=AIzaSyYour_Actual_API_Key_Here
```

Replace `your-gemini-api-key-here` with your actual API key.

---

## 📊 API Quota & Limits

### Free Tier (Default)

- **Rate Limit:** 15 requests per minute (RPM)
- **Daily Quota:** 1,500 requests per day (RPD)
- **Token Limit:** 1 million tokens per minute
- **Cost:** **FREE** 🎉

This is more than enough for:
- Personal use
- Development & testing
- Small-scale production (< 100 users)

### If You Need More

If you exceed the free tier, you can:
1. Enable billing in Google Cloud Console
2. Pay-as-you-go pricing (very affordable)
3. Gemini 1.5 Flash pricing: **$0.35 per 1M input tokens**

---

## 🧪 Test Your Setup

### Method 1: Using the API

Once your server is running with the API key:

```bash
# 1. Create a user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","name":"Test User"}'

# 2. Connect Gmail (follow OAuth flow)
# See GMAIL-SETUP.md for details

# 3. Fetch and summarize emails
curl -X POST http://localhost:5000/api/ai/summarize/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 5}'
```

### Method 2: Check Logs

Start your server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected
✅ Server running on port 5000
```

If there's an issue with the Gemini API key, you'll see:
```
❌ GEMINI_API_KEY is not set in environment variables
```

---

## 🔍 Troubleshooting

### Error: "GEMINI_API_KEY is not set"

**Solution:**
1. Make sure `.env` file exists in `backend/` folder
2. Check the variable name is exactly: `GEMINI_API_KEY`
3. Restart your server after updating `.env`

### Error: "API key not valid"

**Solution:**
1. Verify your API key is correct (39 characters, starts with `AIzaSy`)
2. Make sure you copied the entire key without spaces
3. Try generating a new API key

### Error: "Quota exceeded" or "Rate limit"

**Solution:**
1. Wait a few minutes (rate limit resets)
2. Reduce `maxResults` in summarization requests
3. Implement batching/throttling in your code
4. Consider enabling billing for higher quotas

### Error: "Model not found" or "Permission denied"

**Solution:**
1. Make sure you're using a valid model name: `gemini-1.5-flash`
2. Check that the API key has the correct permissions
3. Try creating a new API key

---

## 📝 What Gets Summarized?

The AI service provides:

1. **Summary** - 1-2 sentence overview of the email
2. **Key Points** - 3-5 bullet points of main topics
3. **Tags** - 3-5 relevant keywords/categories
4. **Sentiment** - positive, neutral, or negative

Example output:
```json
{
  "summary": "Your boss is requesting a status update on the Q4 project by Friday.",
  "keyPoints": [
    "Status update needed",
    "Deadline: Friday",
    "Q4 project focus"
  ],
  "tags": ["work", "urgent", "deadline"],
  "sentiment": "neutral"
}
```

---

## 🎯 Best Practices

### 1. Keep It Private
- Never commit your `.env` file to Git
- `.gitignore` should include `.env`

### 2. Batch Processing
For efficiency, process multiple emails at once:
```javascript
// Good - batch processing
POST /api/ai/summarize/:userId
{ "maxResults": 10 }

// Less efficient - one at a time
POST /api/ai/summarize-one
{ "emailId": "123" }
```

### 3. Rate Limiting
If you have many users, implement rate limiting to stay within quotas.

### 4. Caching
Don't re-summarize the same email - the API checks for existing summaries.

---

## 🔗 Useful Links

- **Get API Key:** https://makersuite.google.com/app/apikey
- **Gemini Documentation:** https://ai.google.dev/docs
- **Pricing:** https://ai.google.dev/pricing
- **Models Guide:** https://ai.google.dev/models/gemini

---

## ✅ Setup Complete?

If you've:
- ✅ Created your Gemini API key
- ✅ Added it to `.env`
- ✅ Restarted your server
- ✅ Tested with a sample email

You're ready to start summarizing emails! 🎉

Next step: **Test the full flow** (Gmail fetch → AI summarize → Store summary)
