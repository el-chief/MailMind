import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export class GmailService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL for user to authenticate
  getAuthUrl(userId?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: userId // Pass userId as state to retrieve it in callback
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials for authenticated requests
  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Refresh access token if expired
  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Fetch emails from Gmail
  async fetchEmails(maxResults: number = 50) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // Get list of message IDs
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread OR newer_than:1d' // Get unread or emails from last day
    });

    if (!response.data.messages) {
      return [];
    }

    // Fetch full message details
    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        });

        return this.parseEmail(msg.data);
      })
    );

    return emails;
  }

  // Parse email data into our format
  private parseEmail(message: any) {
    const headers = message.payload.headers;
    const getHeader = (name: string) => {
      const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    // Extract email body
    let body = '';
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      // Handle multipart messages
      const textPart = message.payload.parts.find(
        (part: any) => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    // Clean HTML tags if present
    body = this.cleanHtml(body);

    // Parse sender
    const from = getHeader('From');
    const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/) || [null, from, from];

    return {
      emailId: message.id,
      threadId: message.threadId,
      subject: getHeader('Subject'),
      sender: {
        name: senderMatch[1]?.trim() || senderMatch[2],
        email: senderMatch[2]
      },
      body: body.substring(0, 5000), // Limit body length
      receivedAt: new Date(parseInt(message.internalDate)),
      snippet: message.snippet,
      labelIds: message.labelIds || []
    };
  }

  // Remove HTML tags from body
  private cleanHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Mark email as read (optional)
  async markAsRead(emailId: string) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: emailId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }
}
