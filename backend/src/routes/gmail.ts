import express from 'express';
import type { Request, Response } from 'express';
import { GmailService } from '../services/gmail.service';
import { GmailToken } from '../models/GmailToken';

const router = express.Router();
const gmailService = new GmailService();

// Step 1: Get OAuth URL
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required as a query parameter'
      });
    }

    const authUrl = gmailService.getAuthUrl(userId as string);
    
    res.status(200).json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate auth URL'
    });
  }
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Code and userId (state) are required'
      });
    }

    // Exchange code for tokens
    const tokens = await gmailService.getTokensFromCode(code as string);

    if (!tokens.access_token || !tokens.refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get tokens'
      });
    }

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokens.expiry_date || 3600));

    // Save or update tokens in database
    await GmailToken.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope || 'https://www.googleapis.com/auth/gmail.readonly'
      },
      { upsert: true, new: true }
    );

    // Send success response (you can redirect to a frontend success page instead)
    res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #4CAF50;">✓ Gmail Connected Successfully!</h1>
          <p>You can close this window and return to the application.</p>
          <p style="color: #666; font-size: 14px;">User ID: ${userId}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #f44336;">✗ Connection Failed</h1>
          <p>Failed to connect Gmail. Please try again.</p>
          <p style="color: #666; font-size: 12px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        </body>
      </html>
    `);
  }
});

// Fetch emails for a user
router.get('/fetch/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { maxResults = 50 } = req.query;

    // Get user's Gmail tokens
    const tokenData = await GmailToken.findOne({ userId });

    if (!tokenData) {
      return res.status(404).json({
        success: false,
        message: 'Gmail not connected. Please authenticate first.'
      });
    }

    // Check if token is expired and refresh if needed
    if (new Date() >= tokenData.expiresAt) {
      const newTokens = await gmailService.refreshAccessToken(tokenData.refreshToken);
      
      tokenData.accessToken = newTokens.access_token!;
      if (newTokens.expiry_date) {
        tokenData.expiresAt = new Date(newTokens.expiry_date);
      }
      await tokenData.save();
    }

    // Set credentials and fetch emails
    gmailService.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken
    });

    const emails = await gmailService.fetchEmails(Number(maxResults));

    res.status(200).json({
      success: true,
      data: emails,
      count: emails.length
    });
  } catch (error: any) {
    console.error('Fetch emails error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch emails'
    });
  }
});

// Check Gmail connection status
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const tokenData = await GmailToken.findOne({ userId });

    if (!tokenData) {
      return res.status(200).json({
        success: true,
        data: {
          connected: false,
          message: 'Gmail not connected'
        }
      });
    }

    const isExpired = new Date() >= tokenData.expiresAt;

    res.status(200).json({
      success: true,
      data: {
        connected: true,
        isExpired,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope
      }
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Gmail status'
    });
  }
});

// Disconnect Gmail
router.delete('/disconnect/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    await GmailToken.findOneAndDelete({ userId });

    res.status(200).json({
      success: true,
      message: 'Gmail disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Gmail'
    });
  }
});

export default router;
