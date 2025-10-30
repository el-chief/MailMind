# 🔐 Setting Up Google OAuth for Gmail Integration

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "MailMind" and click "Create"

## Step 2: Enable Gmail API

1. In the left menu, go to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on it and click **"Enable"**

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (or Internal if you have a workspace)
   - App name: **MailMind**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `https://www.googleapis.com/auth/gmail.readonly`
   - Test users: Add your Gmail address
   - Click **Save and Continue**

4. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **MailMind Backend**
   - Authorized redirect URIs: Add `http://localhost:5000/api/gmail/callback`
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**

## Step 4: Update .env File

Open `backend/.env` and update:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback
```

## Step 5: Test the Integration

### 1. Get Auth URL
```bash
curl http://localhost:5000/api/gmail/auth-url
```

This returns an authorization URL like:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### 2. Authorize in Browser
- Copy the `authUrl` and open it in your browser
- Sign in with your Gmail account
- Allow the permissions
- You'll be redirected to the callback URL with a `code` parameter

### 3. Complete Authentication
```bash
curl -X POST http://localhost:5000/api/gmail/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "THE_CODE_FROM_CALLBACK_URL",
    "userId": "YOUR_USER_ID"
  }'
```

### 4. Fetch Emails
```bash
curl http://localhost:5000/api/gmail/fetch/YOUR_USER_ID
```

### 5. Check Connection Status
```bash
curl http://localhost:5000/api/gmail/status/YOUR_USER_ID
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gmail/auth-url` | Get OAuth authorization URL |
| POST | `/api/gmail/callback` | Handle OAuth callback |
| GET | `/api/gmail/fetch/:userId` | Fetch emails from Gmail |
| GET | `/api/gmail/status/:userId` | Check connection status |
| DELETE | `/api/gmail/disconnect/:userId` | Disconnect Gmail |

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to git
- Keep Client Secret secure
- Use HTTPS in production
- Implement proper token encryption in production

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console exactly matches the one in your .env
- Include `http://` prefix
- Check for trailing slashes

### "access_denied" Error
- Make sure you added your email as a test user in OAuth consent screen
- The app might need verification if you want to use it publicly

### Token Expired
- The system automatically refreshes expired tokens
- Refresh tokens are valid for a long time (months/years)

## Production Deployment

For production, update:
```bash
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/gmail/callback
```

And add this URL to Google Console → Credentials → Authorized redirect URIs

## ✅ Next Steps

Once Gmail is connected:
1. Fetch emails successfully ✅
2. Add AI summarization
3. Automate daily fetching
4. Build frontend
