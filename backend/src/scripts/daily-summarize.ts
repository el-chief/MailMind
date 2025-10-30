import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../db';
import { User } from '../models/User';
import { GmailToken } from '../models/GmailToken';
import { Summary } from '../models/Summary';
import { GmailService } from '../services/gmail.service';
import { AIService } from '../services/ai.service';

const gmailService = new GmailService();
const aiService = new AIService();

interface ProcessResult {
  userId: string;
  userEmail: string;
  emailsFetched: number;
  emailsSummarized: number;
  emailsFailed: number;
  emailsSkipped: number;
  errors: string[];
}

/**
 * Process a single user's emails
 */
async function processUserEmails(userId: string, maxEmails: number = 20): Promise<ProcessResult> {
  const result: ProcessResult = {
    userId,
    userEmail: '',
    emailsFetched: 0,
    emailsSummarized: 0,
    emailsFailed: 0,
    emailsSkipped: 0,
    errors: []
  };

  try {
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      result.errors.push('User not found');
      return result;
    }
    result.userEmail = user.email;

    // Get Gmail tokens
    const tokenData = await GmailToken.findOne({ userId });
    if (!tokenData) {
      result.errors.push('Gmail not connected');
      return result;
    }

    // Check if token is expired and refresh if needed
    if (new Date() >= tokenData.expiresAt) {
      console.log(`  ⟳ Refreshing access token for ${user.email}...`);
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

    console.log(`  📥 Fetching up to ${maxEmails} emails...`);
    const emails = await gmailService.fetchEmails(maxEmails);
    result.emailsFetched = emails.length;

    if (emails.length === 0) {
      console.log(`  ℹ️  No emails found`);
      return result;
    }

    // Filter out already-summarized emails
    const existingSummaries = await Summary.find({
      userId,
      emailId: { $in: emails.map((e: any) => e.emailId) }
    });

    const existingEmailIds = new Set(existingSummaries.map((s: any) => s.emailId));
    const newEmails = emails.filter((e: any) => !existingEmailIds.has(e.emailId));
    result.emailsSkipped = existingEmailIds.size;

    if (newEmails.length === 0) {
      console.log(`  ✓ All ${emails.length} emails already summarized`);
      return result;
    }

    console.log(`  🤖 Summarizing ${newEmails.length} new emails with AI...`);

    // Summarize new emails with rate limiting
    for (let i = 0; i < newEmails.length; i++) {
      const email = newEmails[i] as any;
      
      try {
        const aiResult = await aiService.summarizeEmail({
          from: `${email.sender.name} <${email.sender.email}>`,
          subject: email.subject,
          body: email.snippet || email.body || '',
          date: email.receivedAt.toISOString()
        });

        await Summary.create({
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

        result.emailsSummarized++;
        console.log(`    ✓ [${i + 1}/${newEmails.length}] ${email.subject.substring(0, 50)}...`);

        // Rate limiting: Wait 4 seconds between requests (15 requests/minute limit)
        if (i < newEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }
      } catch (error: any) {
        result.emailsFailed++;
        result.errors.push(`Email ${email.emailId}: ${error.message}`);
        console.error(`    ✗ Failed: ${email.subject.substring(0, 50)}...`);
      }
    }

    return result;

  } catch (error: any) {
    result.errors.push(`Processing error: ${error.message}`);
    return result;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 MailMind - Daily Email Summarization');
  console.log('========================================\n');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ MongoDB connected\n');

    // Get user ID from environment or process all users
    const targetUserId = process.env.USER_ID;
    const maxEmails = parseInt(process.env.MAX_EMAILS || '20');

    let usersToProcess: string[];

    if (targetUserId) {
      console.log(`👤 Processing single user: ${targetUserId}\n`);
      usersToProcess = [targetUserId];
    } else {
      // Get all users with Gmail connected
      console.log('👥 Finding all users with Gmail connected...');
      const tokens = await GmailToken.find({});
      usersToProcess = tokens.map((t: any) => t.userId.toString());
      console.log(`Found ${usersToProcess.length} user(s) to process\n`);
    }

    if (usersToProcess.length === 0) {
      console.log('⚠️  No users to process. Exiting.');
      return;
    }

    // Process each user
    const results: ProcessResult[] = [];
    
    for (let i = 0; i < usersToProcess.length; i++) {
      const userId = usersToProcess[i]!;
      console.log(`\n[${ i + 1}/${usersToProcess.length}] Processing user: ${userId}`);
      console.log('─'.repeat(60));
      
      const result = await processUserEmails(userId, maxEmails);
      results.push(result);

      // Wait between users to avoid rate limits
      if (i < usersToProcess.length - 1) {
        console.log('\n  ⏳ Waiting 5 seconds before next user...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Print summary
    console.log('\n\n📊 Summary Report');
    console.log('========================================\n');

    let totalFetched = 0;
    let totalSummarized = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    results.forEach(result => {
      totalFetched += result.emailsFetched;
      totalSummarized += result.emailsSummarized;
      totalFailed += result.emailsFailed;
      totalSkipped += result.emailsSkipped;

      console.log(`👤 ${result.userEmail || result.userId}`);
      console.log(`   📥 Fetched: ${result.emailsFetched}`);
      console.log(`   ✅ Summarized: ${result.emailsSummarized}`);
      console.log(`   ⏭️  Skipped: ${result.emailsSkipped}`);
      console.log(`   ❌ Failed: ${result.emailsFailed}`);
      
      if (result.errors.length > 0) {
        console.log(`   ⚠️  Errors:`);
        result.errors.forEach(err => console.log(`      - ${err}`));
      }
      console.log('');
    });

    console.log('─'.repeat(60));
    console.log(`📊 Total Users Processed: ${results.length}`);
    console.log(`📥 Total Emails Fetched: ${totalFetched}`);
    console.log(`✅ Total Summarized: ${totalSummarized}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log('');

    if (totalSummarized > 0) {
      console.log('🎉 Daily summarization completed successfully!');
    } else if (totalSkipped > 0) {
      console.log('ℹ️  No new emails to summarize (all already processed)');
    } else {
      console.log('⚠️  No emails were summarized');
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await disconnectDatabase();
    console.log('✅ Disconnected\n');
  }
}

// Execute
main()
  .then(() => {
    console.log('✨ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
