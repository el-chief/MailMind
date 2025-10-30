import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Summary } from '../models/Summary';
import { GmailToken } from '../models/GmailToken';

const router = express.Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(health);
});

/**
 * Detailed health check with database
 * GET /health/detailed
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    const dbHealthy = dbState === 1;

    // Get stats
    let stats = {
      users: 0,
      summaries: 0,
      gmailConnections: 0
    };

    if (dbHealthy) {
      try {
        stats.users = await User.countDocuments();
        stats.summaries = await Summary.countDocuments();
        stats.gmailConnections = await GmailToken.countDocuments();
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    const responseTime = Date.now() - startTime;

    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        healthy: dbHealthy,
        type: 'mongodb'
      },
      stats,
      performance: {
        responseTime: `${responseTime}ms`,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Readiness probe (for Kubernetes/Railway)
 * GET /health/ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    const dbReady = mongoose.connection.readyState === 1;
    
    // Check if essential env vars are set
    const envReady = !!(
      process.env.MONGODB_URI &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GEMINI_API_KEY
    );

    const ready = dbReady && envReady;

    if (ready) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbReady,
          environment: envReady
        }
      });
    }
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * Liveness probe (for Kubernetes/Railway)
 * GET /health/live
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get system metrics
 * GET /health/metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: process.uptime(),
        formatted: formatUptime(process.uptime())
      },
      memory: {
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
        rss: process.memoryUsage().rss,
        external: process.memoryUsage().external,
        formatted: {
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
        }
      },
      cpu: process.cpuUsage(),
      platform: {
        os: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      }
    };

    res.status(200).json(metrics);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export default router;
