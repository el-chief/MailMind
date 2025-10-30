import express from 'express';
import type { Request, Response } from 'express';
import { Summary } from '../models/Summary';

const router = express.Router();

// Create a new summary
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      emailId,
      sender,
      subject,
      summary,
      keyPoints,
      tags,
      receivedAt
    } = req.body;

    if (!userId || !emailId || !sender || !subject || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    const newSummary = await Summary.create({
      userId,
      emailId,
      sender,
      subject,
      summary,
      keyPoints: keyPoints || [],
      tags: tags || [],
      receivedAt: receivedAt || new Date()
    });

    res.status(201).json({
      success: true,
      data: newSummary
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Summary already exists for this email'
      });
    }
    console.error('Create summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get summaries for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { date, limit = 50, skip = 0 } = req.query;

    let query: any = { userId };

    // Filter by date if provided (YYYY-MM-DD)
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.receivedAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const summaries = await Summary.find(query)
      .sort({ receivedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Summary.countDocuments(query);

    res.status(200).json({
      success: true,
      data: summaries,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip)
      }
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get a single summary
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findById(req.params.id);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete a summary
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const summary = await Summary.findByIdAndDelete(req.params.id);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Summary deleted successfully'
    });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
