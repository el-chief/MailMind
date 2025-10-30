# MailMind Backend API - Testing Guide

Server running on: **http://localhost:5000**

## 🚀 Available Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

### Authentication

#### Login/Create User
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

#### Get User
```bash
GET http://localhost:5000/api/auth/{userId}
```

### Gmail Integration

#### Step 1: Get OAuth URL
```bash
# Replace USER_ID with your actual user ID from the auth endpoint
GET http://localhost:5000/api/gmail/auth-url?userId=YOUR_USER_ID
```
**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```
**Action:** Open the `authUrl` in a browser, authorize the app, and Google will redirect back to the callback URL automatically.

#### Step 2: OAuth Callback (Automatic)
```bash
# This happens automatically when Google redirects after authorization
GET http://localhost:5000/api/gmail/callback?code=AUTHORIZATION_CODE&state=USER_ID
```
**Note:** You don't need to call this manually. Google will redirect to this endpoint after you authorize.

#### Fetch Emails
```bash
GET http://localhost:5000/api/gmail/fetch/{userId}?maxResults=50
```

#### Check Gmail Status
```bash
GET http://localhost:5000/api/gmail/status/{userId}
```

#### Disconnect Gmail
```bash
DELETE http://localhost:5000/api/gmail/disconnect/{userId}
```

### AI Summarization

#### Summarize New Emails Automatically
```bash
# Fetch emails from Gmail and summarize them with AI
POST http://localhost:5000/api/ai/summarize/{userId}
Content-Type: application/json

{
  "maxResults": 10,
  "onlyUnread": true
}
```
**Response:**
```json
{
  "success": true,
  "message": "Summarized 5 emails",
  "data": {
    "summarized": 5,
    "failed": 0,
    "skipped": 3,
    "results": [
      {
        "success": true,
        "emailId": "abc123",
        "summaryId": "summary-id"
      }
    ]
  }
}
```

#### Generate Daily Digest
```bash
# Get AI-generated digest of all emails for a specific date
GET http://localhost:5000/api/ai/digest/{userId}?date=2025-10-31
```
**Response:**
```json
{
  "success": true,
  "data": {
    "digest": "Today you received 8 emails. Key highlights include...",
    "count": 8,
    "date": "2025-10-31"
  }
}
```

### Email Summaries

#### Create Summary
```bash
POST http://localhost:5000/api/summaries
Content-Type: application/json

{
  "userId": "your-user-id-here",
  "emailId": "email-123",
  "sender": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "subject": "Meeting tomorrow",
  "summary": "John is confirming the meeting scheduled for tomorrow at 2 PM in the conference room.",
  "keyPoints": [
    "Meeting at 2 PM",
    "Conference room",
    "Bring project documents"
  ],
  "tags": ["work", "meeting"],
  "receivedAt": "2025-10-31T10:00:00Z"
}
```

#### Get User's Summaries
```bash
# Get all summaries for a user
GET http://localhost:5000/api/summaries/user/{userId}

# With pagination
GET http://localhost:5000/api/summaries/user/{userId}?limit=10&skip=0

# Filter by date (YYYY-MM-DD)
GET http://localhost:5000/api/summaries/user/{userId}?date=2025-10-31
```

#### Get Single Summary
```bash
GET http://localhost:5000/api/summaries/{summaryId}
```

#### Delete Summary
```bash
DELETE http://localhost:5000/api/summaries/{summaryId}
```

## 📝 Quick Test Flow

### Testing User & Summaries

1. **Create a user:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

2. **Copy the returned user ID, then create a summary:**
```bash
curl -X POST http://localhost:5000/api/summaries \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID_HERE",
    "emailId":"email-001",
    "sender":{"name":"Boss","email":"boss@company.com"},
    "subject":"Project Update",
    "summary":"Boss wants status update on Q4 project by Friday",
    "keyPoints":["Status update needed","Deadline: Friday","Q4 project"],
    "tags":["work","urgent"]
  }'
```

3. **Get all summaries:**
```bash
curl http://localhost:5000/api/summaries/user/USER_ID_HERE
```

### Testing Gmail Integration

1. **First, create a user (if you haven't):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","name":"Your Name"}'
```
Save the returned `_id` as YOUR_USER_ID.

2. **Get the OAuth URL:**
```bash
curl "http://localhost:5000/api/gmail/auth-url?userId=YOUR_USER_ID"
```

3. **Open the returned `authUrl` in your browser** and authorize the app.

4. **After authorization, you'll be redirected back** to the callback URL automatically, and you'll see a success page.

5. **Fetch your emails:**
```bash
curl "http://localhost:5000/api/gmail/fetch/YOUR_USER_ID?maxResults=10"
```

6. **Check connection status:**
```bash
curl "http://localhost:5000/api/gmail/status/YOUR_USER_ID"
```

### Testing AI Summarization

**Prerequisites:** You must have Gmail connected and have some emails in your account.

1. **Fetch and summarize emails automatically:**
```bash
curl -X POST "http://localhost:5000/api/ai/summarize/YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"maxResults": 5, "onlyUnread": true}'
```
This will:
- Fetch your latest 5 emails from Gmail
- Summarize each email with AI (summary, key points, tags)
- Store the summaries in the database
- Skip emails that are already summarized

2. **View your summaries:**
```bash
curl "http://localhost:5000/api/summaries/user/YOUR_USER_ID"
```

3. **Get daily digest:**
```bash
curl "http://localhost:5000/api/ai/digest/YOUR_USER_ID?date=2025-10-31"
```

## 🎯 What's Working

✅ User creation and login (simple, no OAuth yet)  
✅ Store email summaries  
✅ Retrieve summaries by user  
✅ Filter by date  
✅ Pagination support  
✅ MongoDB integration  
✅ CORS configured  
✅ **Gmail OAuth integration**  
✅ **Fetch emails from Gmail**  
✅ **Auto token refresh**  
✅ **AI-powered email summarization (Gemini)**
✅ **Automatic batch processing**
✅ **Daily digest generation**

## 🔜 Next Steps

- [x] Add Gmail OAuth integration
- [x] Add AI summarization (Google Gemini)
- [ ] Add scheduled tasks (auto-fetch daily with GitHub Actions)
- [ ] Add frontend dashboard
- [ ] Add notifications (Telegram/Discord)
- [ ] Add email search and filtering

## 📊 Current Status

**Phase 2 Complete:** Backend Core - MVP Ready! 🎉  
**Database:** MongoDB Connected ✅  
**API:** RESTful endpoints working ✅  
**Models:** User, Summary, GmailToken ✅  
**Gmail:** OAuth + Email Fetching ✅  
**AI:** Gemini Summarization ✅  
