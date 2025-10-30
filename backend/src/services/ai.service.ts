import { GoogleGenerativeAI } from '@google/generative-ai';

interface EmailData {
  from: string;
  subject: string;
  body: string;
  date?: string;
}

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  tags: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.0-flash-exp for fast, cost-effective summarization
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Summarize a single email
   */
  async summarizeEmail(email: EmailData): Promise<SummaryResult> {
    const prompt = this.buildSummarizationPrompt(email);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return this.parseAIResponse(text);
    } catch (error: any) {
      console.error('AI Summarization error:', error);
      throw new Error(`Failed to summarize email: ${error.message}`);
    }
  }

  /**
   * Summarize multiple emails in batch
   */
  async summarizeEmails(emails: EmailData[]): Promise<SummaryResult[]> {
    const promises = emails.map(email => this.summarizeEmail(email));
    return Promise.all(promises);
  }

  /**
   * Build the prompt for email summarization
   */
  private buildSummarizationPrompt(email: EmailData): string {
    return `You are an AI assistant that summarizes emails concisely and accurately.

Analyze the following email and provide:
1. A brief summary (1-2 sentences)
2. Key points (3-5 bullet points)
3. Relevant tags (3-5 keywords)
4. Sentiment (positive, neutral, or negative)

Email Details:
From: ${email.from}
Subject: ${email.subject}
${email.date ? `Date: ${email.date}` : ''}

Body:
${email.body}

---

Please respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "summary": "Brief 1-2 sentence summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "sentiment": "positive|neutral|negative"
}`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(text: string): SummaryResult {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanText);

      return {
        summary: parsed.summary || 'No summary available',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        sentiment: parsed.sentiment || 'neutral'
      };
    } catch (error) {
      console.error('Failed to parse AI response:', text);
      
      // Fallback: Return a basic summary
      return {
        summary: 'Unable to generate summary',
        keyPoints: [],
        tags: [],
        sentiment: 'neutral'
      };
    }
  }

  /**
   * Generate a daily digest summary from multiple summaries
   */
  async generateDigest(summaries: Array<{ subject: string; summary: string; tags: string[] }>): Promise<string> {
    const prompt = `You are creating a daily email digest. Summarize the following email summaries into a concise daily overview (3-4 sentences):

${summaries.map((s, i) => `${i + 1}. ${s.subject}: ${s.summary}`).join('\n')}

Provide a brief, friendly overview of what happened in these emails today.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Digest generation error:', error);
      return 'Unable to generate daily digest';
    }
  }
}
