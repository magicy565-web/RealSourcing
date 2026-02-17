import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from './middleware/auth.js';
import { getDb } from './db.js';
import { webinars, webinarParticipants, users, factories } from '../drizzle/schema.js';
import { eq, and, or, like, desc, asc, sql, isNull, ne } from 'drizzle-orm';

const router = Router();

// ============================================================================
// Helper: Build webinar response with computed fields
// ============================================================================
function enrichWebinar(w: any, participants?: any[], creator?: any) {
  return {
    ...w,
    creator: creator ? { id: creator.id, name: creator.name, avatar: creator.avatar, role: creator.role } : undefined,
    participants: participants || [],
    participantCount: participants?.length || w.currentParticipants || 0,
    isLive: w.status === 'live',
    isUpcoming: w.status === 'scheduled' && w.scheduledAt && new Date(w.scheduledAt) > new Date(),
    isPast: w.status === 'completed' || w.status === 'cancelled',
    timeUntilStart: w.scheduledAt ? Math.max(0, new Date(w.scheduledAt).getTime() - Date.now()) : null,
  };
}

// ============================================================================
// GET /api/webinars/public — List public webinars (no auth required)
// ============================================================================
router.get('/public', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const {
      status = 'scheduled',
      category,
      search,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions (only show non-deleted, public webinars)
    const conditions: any[] = [isNull(webinars.deletedAt)];

    if (status && status !== 'all') {
      conditions.push(eq(webinars.status, status as any));
    }

    if (category) {
      conditions.push(eq(webinars.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(webinars.title, `%${search}%`),
          like(webinars.description, `%${search}%`)
        )
      );
    }

    // Build ORDER BY
    let orderBy: any;
    switch (sort) {
      case 'oldest':
        orderBy = asc(webinars.createdAt);
        break;
      case 'upcoming':
        orderBy = asc(webinars.scheduledAt);
        break;
      case 'popular':
        orderBy = desc(webinars.currentParticipants);
        break;
      default: // 'newest'
        orderBy = desc(webinars.createdAt);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(webinars)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(webinars)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    res.json({
      success: true,
      webinars: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public webinars:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch webinars' });
  }
});

// ============================================================================
// GET /api/webinars — List webinars with search, filter, pagination, sorting
// ============================================================================
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const {
      status,
      category,
      search,
      sort = 'newest',
      page = '1',
      limit = '12',
      mine,
    } = req.query as Record<string, string>;

    const user = (req as any).user;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    const conditions: any[] = [isNull(webinars.deletedAt)];

    if (status && status !== 'all') {
      conditions.push(eq(webinars.status, status as any));
    }

    if (category) {
      conditions.push(eq(webinars.category, category));
    }

    if (search) {
      conditions.push(
        or(
          like(webinars.title, `%${search}%`),
          like(webinars.description, `%${search}%`)
        )
      );
    }

    if (mine === 'true') {
      conditions.push(eq(webinars.createdById, user.id));
    }

    // Build ORDER BY
    let orderBy: any;
    switch (sort) {
      case 'oldest':
        orderBy = asc(webinars.createdAt);
        break;
      case 'upcoming':
        orderBy = asc(webinars.scheduledAt);
        break;
      case 'popular':
        orderBy = desc(webinars.currentParticipants);
        break;
      default: // 'newest'
        orderBy = desc(webinars.createdAt);
    }

    // Execute query with pagination
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(webinars)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(webinars)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;

    // Fetch creators for all webinars
    const creatorIds = [...new Set(items.map(w => w.createdById))];
    let creatorsMap: Record<number, any> = {};
    if (creatorIds.length > 0) {
      const creators = await db
        .select({ id: users.id, name: users.name, avatar: users.avatar, role: users.role })
        .from(users)
        .where(sql`${users.id} IN (${sql.join(creatorIds.map(id => sql`${id}`), sql`, `)})`);
      creatorsMap = Object.fromEntries(creators.map(c => [c.id, c]));
    }

    // Fetch participant counts for all webinars
    const webinarIds = items.map(w => w.id);
    let participantCounts: Record<number, number> = {};
    if (webinarIds.length > 0) {
      const counts = await db
        .select({
          webinarId: webinarParticipants.webinarId,
          count: sql<number>`count(*)`,
        })
        .from(webinarParticipants)
        .where(
          and(
            sql`${webinarParticipants.webinarId} IN (${sql.join(webinarIds.map(id => sql`${id}`), sql`, `)})`,
            ne(webinarParticipants.status, 'declined')
          )
        )
        .groupBy(webinarParticipants.webinarId);
      participantCounts = Object.fromEntries(counts.map(c => [c.webinarId, c.count]));
    }

    const enrichedItems = items.map(w => ({
      ...enrichWebinar(w, undefined, creatorsMap[w.createdById]),
      participantCount: participantCounts[w.id] || 0,
    }));

    res.json({
      success: true,
      webinars: enrichedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching webinars:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch webinars' });
  }
});

// ============================================================================
// GET /api/webinars/stats — Get webinar statistics for the current user
// ============================================================================
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;

    const [totalResult, draftResult, scheduledResult, liveResult, completedResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(webinars)
        .where(and(eq(webinars.createdById, user.id), isNull(webinars.deletedAt))),
      db.select({ count: sql<number>`count(*)` }).from(webinars)
        .where(and(eq(webinars.createdById, user.id), eq(webinars.status, 'draft'), isNull(webinars.deletedAt))),
      db.select({ count: sql<number>`count(*)` }).from(webinars)
        .where(and(eq(webinars.createdById, user.id), eq(webinars.status, 'scheduled'), isNull(webinars.deletedAt))),
      db.select({ count: sql<number>`count(*)` }).from(webinars)
        .where(and(eq(webinars.createdById, user.id), eq(webinars.status, 'live'), isNull(webinars.deletedAt))),
      db.select({ count: sql<number>`count(*)` }).from(webinars)
        .where(and(eq(webinars.createdById, user.id), eq(webinars.status, 'completed'), isNull(webinars.deletedAt))),
    ]);

    res.json({
      success: true,
      stats: {
        total: totalResult[0]?.count || 0,
        draft: draftResult[0]?.count || 0,
        scheduled: scheduledResult[0]?.count || 0,
        live: liveResult[0]?.count || 0,
        completed: completedResult[0]?.count || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching webinar stats:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch stats' });
  }
});

// ============================================================================
// GET /api/webinars/categories — Get distinct categories
// ============================================================================
router.get('/categories', requireAuth, async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const result = await db
      .selectDistinct({ category: webinars.category })
      .from(webinars)
      .where(and(isNull(webinars.deletedAt), sql`${webinars.category} IS NOT NULL AND ${webinars.category} != ''`));

    res.json({
      success: true,
      categories: result.map(r => r.category).filter(Boolean),
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch categories' });
  }
});

// ============================================================================
// POST /api/webinars — Create a new webinar
// ============================================================================
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;

    const {
      title,
      description,
      category,
      type = 'webinar',
      language = 'en',
      scheduledAt,
      duration = 60,
      maxParticipants = 100,
      coverImage,
      tags,
      recordingEnabled = true,
      workSpec,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    // Generate Agora channel name
    const channelName = `webinar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Determine initial status
    const initialStatus = scheduledAt ? 'scheduled' : 'draft';

    // Insert webinar
    const result = await db.insert(webinars).values({
      createdById: user.id,
      title,
      description: description || null,
      category: category || null,
      type: type as any,
      status: initialStatus,
      language,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      duration,
      maxParticipants,
      currentParticipants: 0,
      coverImage: coverImage || null,
      tags: tags || null,
      recordingEnabled: recordingEnabled ? 1 : 0,
      agoraChannelName: channelName,
      workSpec: workSpec || null,
    });

    const webinarId = result[0].insertId;

    // Auto-add creator as host
    await db.insert(webinarParticipants).values({
      webinarId,
      userId: user.id,
      role: 'host',
      status: 'accepted',
      invitedAt: new Date(),
    });

    // Fetch the created webinar
    const [created] = await db.select().from(webinars).where(eq(webinars.id, webinarId));

    res.status(201).json({
      success: true,
      webinar: enrichWebinar(created, [], { id: user.id, name: user.name, avatar: user.avatar, role: user.role }),
    });
  } catch (error: any) {
    console.error('Error creating webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create webinar' });
  }
});

// ============================================================================
// GET /api/webinars/:id — Get webinar detail with participants
// ============================================================================
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const webinarId = parseInt(req.params.id);

    if (isNaN(webinarId)) {
      return res.status(400).json({ success: false, error: 'Invalid webinar ID' });
    }

    const [webinar] = await db
      .select()
      .from(webinars)
      .where(and(eq(webinars.id, webinarId), isNull(webinars.deletedAt)));

    if (!webinar) {
      return res.status(404).json({ success: false, error: 'Webinar not found' });
    }

    // Increment view count
    await db.update(webinars).set({
      viewCount: sql`${webinars.viewCount} + 1`,
    }).where(eq(webinars.id, webinarId));

    // Fetch participants with user info
    const participants = await db
      .select({
        id: webinarParticipants.id,
        userId: webinarParticipants.userId,
        role: webinarParticipants.role,
        status: webinarParticipants.status,
        joinedAt: webinarParticipants.joinedAt,
        userName: users.name,
        userAvatar: users.avatar,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(webinarParticipants)
      .leftJoin(users, eq(webinarParticipants.userId, users.id))
      .where(eq(webinarParticipants.webinarId, webinarId));

    // Fetch creator
    const [creator] = await db
      .select({ id: users.id, name: users.name, avatar: users.avatar, role: users.role, email: users.email })
      .from(users)
      .where(eq(users.id, webinar.createdById));

    // Check if current user is a participant
    const user = (req as any).user;
    const currentUserParticipant = participants.find(p => p.userId === user.id);

    res.json({
      success: true,
      webinar: {
        ...enrichWebinar(webinar, participants, creator),
        isOwner: webinar.createdById === user.id,
        currentUserRole: currentUserParticipant?.role || null,
        currentUserStatus: currentUserParticipant?.status || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch webinar' });
  }
});

// ============================================================================
// PUT /api/webinars/:id — Update a webinar
// ============================================================================
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);

    // Check ownership
    const [existing] = await db
      .select()
      .from(webinars)
      .where(and(eq(webinars.id, webinarId), isNull(webinars.deletedAt)));

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Webinar not found' });
    }

    if (existing.createdById !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    // Only allow editing draft/scheduled webinars (not live/completed)
    if (existing.status === 'live' || existing.status === 'completed') {
      // Allow only status changes for live webinars
      const allowedFields = ['status'];
      const bodyKeys = Object.keys(req.body);
      const hasNonStatusFields = bodyKeys.some(k => !allowedFields.includes(k));
      if (hasNonStatusFields) {
        return res.status(400).json({
          success: false,
          error: 'Cannot edit a live or completed webinar. Only status changes are allowed.',
        });
      }
    }

    const {
      title, description, category, type, status, language,
      scheduledAt, duration, maxParticipants, coverImage, tags,
      recordingEnabled, workSpec,
    } = req.body;

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (language !== undefined) updateData.language = language;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (duration !== undefined) updateData.duration = duration;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = tags;
    if (recordingEnabled !== undefined) updateData.recordingEnabled = recordingEnabled ? 1 : 0;
    if (workSpec !== undefined) updateData.workSpec = workSpec;

    // Handle status transitions
    if (status !== undefined) {
      const validTransitions: Record<string, string[]> = {
        draft: ['scheduled', 'cancelled'],
        scheduled: ['live', 'cancelled', 'draft'],
        live: ['completed', 'cancelled'],
        completed: [],
        cancelled: ['draft'],
      };

      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Cannot transition from '${existing.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
        });
      }

      updateData.status = status;

      // Set timestamps based on status
      if (status === 'live' && !existing.startedAt) {
        updateData.startedAt = new Date();
      }
      if (status === 'completed' && !existing.endedAt) {
        updateData.endedAt = new Date();
        // Calculate actual duration
        if (existing.startedAt) {
          updateData.actualDuration = Math.round((Date.now() - new Date(existing.startedAt).getTime()) / 60000);
        }
      }
    }

    await db.update(webinars).set(updateData).where(eq(webinars.id, webinarId));

    // Fetch updated webinar
    const [updated] = await db.select().from(webinars).where(eq(webinars.id, webinarId));

    res.json({ success: true, webinar: updated });
  } catch (error: any) {
    console.error('Error updating webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update webinar' });
  }
});

// ============================================================================
// DELETE /api/webinars/:id — Soft delete a webinar
// ============================================================================
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);

    const [existing] = await db
      .select()
      .from(webinars)
      .where(and(eq(webinars.id, webinarId), isNull(webinars.deletedAt)));

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Webinar not found' });
    }

    if (existing.createdById !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    // Cannot delete live webinars
    if (existing.status === 'live') {
      return res.status(400).json({ success: false, error: 'Cannot delete a live webinar. End it first.' });
    }

    await db.update(webinars).set({ deletedAt: new Date() }).where(eq(webinars.id, webinarId));

    res.json({ success: true, message: 'Webinar deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete webinar' });
  }
});

// ============================================================================
// POST /api/webinars/:id/join — Join / register for a webinar
// ============================================================================
router.post('/:id/join', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);
    const { role = 'participant' } = req.body;

    // Check webinar exists
    const [webinar] = await db.select().from(webinars)
      .where(and(eq(webinars.id, webinarId), isNull(webinars.deletedAt)));

    if (!webinar) {
      return res.status(404).json({ success: false, error: 'Webinar not found' });
    }

    // Check capacity
    if (webinar.maxParticipants && webinar.currentParticipants && webinar.currentParticipants >= webinar.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Webinar is full' });
    }

    // Check if already joined
    const [existingParticipant] = await db.select().from(webinarParticipants)
      .where(and(
        eq(webinarParticipants.webinarId, webinarId),
        eq(webinarParticipants.userId, user.id),
      ));

    if (existingParticipant) {
      if (existingParticipant.status === 'declined') {
        // Re-join
        await db.update(webinarParticipants).set({
          status: 'accepted',
          joinedAt: new Date(),
        }).where(eq(webinarParticipants.id, existingParticipant.id));
      } else {
        return res.status(400).json({ success: false, error: 'Already registered for this webinar' });
      }
    } else {
      await db.insert(webinarParticipants).values({
        webinarId,
        userId: user.id,
        role: role as any,
        status: 'accepted',
        invitedAt: new Date(),
        joinedAt: new Date(),
      });
    }

    // Update participant count
    await db.update(webinars).set({
      currentParticipants: sql`${webinars.currentParticipants} + 1`,
    }).where(eq(webinars.id, webinarId));

    res.json({ success: true, message: 'Successfully joined the webinar' });
  } catch (error: any) {
    console.error('Error joining webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to join webinar' });
  }
});

// ============================================================================
// POST /api/webinars/:id/leave — Leave a webinar
// ============================================================================
router.post('/:id/leave', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);

    const [participant] = await db.select().from(webinarParticipants)
      .where(and(
        eq(webinarParticipants.webinarId, webinarId),
        eq(webinarParticipants.userId, user.id),
      ));

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Not registered for this webinar' });
    }

    // Host cannot leave
    if (participant.role === 'host') {
      return res.status(400).json({ success: false, error: 'Host cannot leave the webinar' });
    }

    await db.update(webinarParticipants).set({
      status: 'left',
      leftAt: new Date(),
    }).where(eq(webinarParticipants.id, participant.id));

    // Update participant count
    await db.update(webinars).set({
      currentParticipants: sql`GREATEST(${webinars.currentParticipants} - 1, 0)`,
    }).where(eq(webinars.id, webinarId));

    res.json({ success: true, message: 'Successfully left the webinar' });
  } catch (error: any) {
    console.error('Error leaving webinar:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to leave webinar' });
  }
});

// ============================================================================
// GET /api/webinars/:id/participants — Get participants list
// ============================================================================
router.get('/:id/participants', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const webinarId = parseInt(req.params.id);

    const participants = await db
      .select({
        id: webinarParticipants.id,
        userId: webinarParticipants.userId,
        role: webinarParticipants.role,
        status: webinarParticipants.status,
        joinedAt: webinarParticipants.joinedAt,
        leftAt: webinarParticipants.leftAt,
        userName: users.name,
        userAvatar: users.avatar,
        userEmail: users.email,
        userRole: users.role,
      })
      .from(webinarParticipants)
      .leftJoin(users, eq(webinarParticipants.userId, users.id))
      .where(eq(webinarParticipants.webinarId, webinarId))
      .orderBy(asc(webinarParticipants.joinedAt));

    res.json({ success: true, participants });
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch participants' });
  }
});

// ============================================================================
// POST /api/webinars/:id/status — Quick status change (start/end/cancel)
// ============================================================================
router.post('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);
    const { action } = req.body; // 'start', 'end', 'cancel', 'publish'

    const [webinar] = await db.select().from(webinars)
      .where(and(eq(webinars.id, webinarId), isNull(webinars.deletedAt)));

    if (!webinar) {
      return res.status(404).json({ success: false, error: 'Webinar not found' });
    }

    if (webinar.createdById !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Permission denied' });
    }

    const updateData: any = {};

    switch (action) {
      case 'publish':
        if (webinar.status !== 'draft') {
          return res.status(400).json({ success: false, error: 'Can only publish draft webinars' });
        }
        if (!webinar.scheduledAt) {
          return res.status(400).json({ success: false, error: 'Schedule time is required to publish' });
        }
        updateData.status = 'scheduled';
        break;

      case 'start':
        if (webinar.status !== 'scheduled') {
          return res.status(400).json({ success: false, error: 'Can only start scheduled webinars' });
        }
        updateData.status = 'live';
        updateData.startedAt = new Date();
        break;

      case 'end':
        if (webinar.status !== 'live') {
          return res.status(400).json({ success: false, error: 'Can only end live webinars' });
        }
        updateData.status = 'completed';
        updateData.endedAt = new Date();
        if (webinar.startedAt) {
          updateData.actualDuration = Math.round((Date.now() - new Date(webinar.startedAt).getTime()) / 60000);
        }
        break;

      case 'cancel':
        if (webinar.status === 'completed' || webinar.status === 'cancelled') {
          return res.status(400).json({ success: false, error: 'Cannot cancel a completed or already cancelled webinar' });
        }
        updateData.status = 'cancelled';
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid action. Use: publish, start, end, cancel' });
    }

    await db.update(webinars).set(updateData).where(eq(webinars.id, webinarId));

    const [updated] = await db.select().from(webinars).where(eq(webinars.id, webinarId));

    res.json({ success: true, webinar: updated });
  } catch (error: any) {
    console.error('Error updating webinar status:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update status' });
  }
});

export default router;
