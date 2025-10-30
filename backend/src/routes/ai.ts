import express from 'express';
import type { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { GmailService } from '../services/gmail.service';
import { GmailToken } from '../models/GmailToken';
import { Summary } from '../models/Summary';
import { User } from '../models/User';

const router = express.Router();
const aiService = new AIService();
const gmailService = new GmailService();

/**
 * Fetch emails and summarize them automatically
 * POST /api/ai/summarize/:userId
 */
router.post('/summarize/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { maxResults = 10, onlyUnread = true } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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
    
    if (emails.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No new emails to summarize',
        data: { summarized: 0, skipped: 0 }
      });
    }

    // Filter out emails that are already summarized
    const existingSummaries = await Summary.find({
      userId,
      emailId: { $in: emails.map(e => e.emailId) }
    });

    const existingEmailIds = new Set(existingSummaries.map(s => s.emailId));
    const newEmails = emails.filter(e => !existingEmailIds.has(e.emailId));

    if (newEmails.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All emails are already summarized',
        data: { summarized: 0, skipped: emails.length }
      });
    }

    // Summarize new emails
    const summaryResults = await Promise.all(
      newEmails.map(async (email) => {
        try {
          const aiResult = await aiService.summarizeEmail({
            from: `${email.sender.name} <${email.sender.email}>`,
            subject: email.subject,
            body: email.snippet || email.body || '',
            date: email.receivedAt.toISOString()
          });

          // Create summary document
          const summary = await Summary.create({
            userId,
            emailId: email.emailId,
            sender: {
              name: email.sender.name,
              email: email.sender.email
            },
            subject: email.subject,
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints,
            tags: aiResult.tags,
            receivedAt: email.receivedAt,
            summarizedAt: new Date()
          });

          return { success: true, emailId: email.emailId, summaryId: summary._id };
        } catch (error: any) {
          console.error(`Failed to summarize email ${email.emailId}:`, error);
          return { success: false, emailId: email.emailId, error: error.message };
        }
      })
    );

    const successCount = summaryResults.filter(r => r.success).length;
    const failCount = summaryResults.filter(r => !r.success).length;

    res.status(200).json({
      success: true,
      message: `Summarized ${successCount} emails`,
      data: {
        summarized: successCount,
        failed: failCount,
        skipped: existingEmailIds.size,
        results: summaryResults
      }
    });

  } catch (error: any) {
    console.error('Summarize emails error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to summarize emails'
    });
  }
});

/**
 * Summarize a specific email by ID
 * POST /api/ai/summarize-one
 */
router.post('/summarize-one', async (req: Request, res: Response) => {
  try {
    const { userId, emailId } = req.body;

    if (!userId || !emailId) {
      return res.status(400).json({
        success: false,
        message: 'userId and emailId are required'
      });
    }

    // Check if already summarized
    const existing = await Summary.findOne({ userId, emailId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Email already summarized',
        data: existing
      });
    }

    // Get Gmail tokens
    const tokenData = await GmailToken.findOne({ userId });
    if (!tokenData) {
      return res.status(404).json({
        success: false,
        message: 'Gmail not connected'
      });
    }

    // Fetch the specific email
    gmailService.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken
    });

    // Note: You'd need to add a fetchEmailById method to GmailService
    // For now, we'll return an error
    return res.status(501).json({
      success: false,
      message: 'Single email summarization not yet implemented. Use /summarize/:userId instead.'
    });

  } catch (error: any) {
    console.error('Summarize single email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to summarize email'
    });
  }
});

/**
 * Generate daily digest from existing summaries
 * GET /api/ai/digest/:userId
 */
router.get('/digest/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    // Get summaries for the specified date (default: today)
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const summaries = await Summary.find({
      userId,
      receivedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).select('subject summary tags');

    if (summaries.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No summaries found for this date',
        data: { digest: null, count: 0 }
      });
    }

    // Generate digest
    const digest = await aiService.generateDigest(summaries);

    res.status(200).json({
      success: true,
      data: {
        digest,
        count: summaries.length,
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error: any) {
    console.error('Generate digest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate digest'
    });
  }
});

export default router;
