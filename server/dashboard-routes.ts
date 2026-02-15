import { Router } from 'express';
import { requireAuth } from './middleware/auth';
import { getDb } from './db';
import { webinars, factories } from '../drizzle/schema';
import { sql, count, eq } from 'drizzle-orm';

const router = Router();

// Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Count live webinars (status = 'live')
    const liveWebinarsResult = await db
      .select({ count: count() })
      .from(webinars)
      .where(eq(webinars.status, 'live'));
    const liveWebinars = liveWebinarsResult[0]?.count || 0;

    // Count scheduled webinars (status = 'scheduled')
    const scheduledWebinarsResult = await db
      .select({ count: count() })
      .from(webinars)
      .where(eq(webinars.status, 'scheduled'));
    const scheduledWebinars = scheduledWebinarsResult[0]?.count || 0;

    // Count total factories
    const totalFactoriesResult = await db
      .select({ count: count() })
      .from(factories);
    const totalFactories = totalFactoriesResult[0]?.count || 0;

    // For now, use mock data for participants and pending reviews
    // These would require more complex queries across multiple tables
    const participants = 0;
    const pendingReviews = 0;

    return res.json({
      success: true,
      stats: {
        liveWebinars,
        scheduledWebinars,
        totalFactories,
        participants,
        pendingReviews,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get dashboard stats' });
  }
});

// Get recent webinars
router.get('/webinars/recent', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const recentWebinars = await db
      .select()
      .from(webinars)
      .orderBy(sql`${webinars.createdAt} DESC`)
      .limit(10);

    return res.json({
      success: true,
      webinars: recentWebinars,
    });
  } catch (error: any) {
    console.error('Get recent webinars error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get recent webinars' });
  }
});

export default router;
