import { Router } from 'express';
import { requireAuth } from './middleware/auth.js';
import { getDb } from './db.js';
import { webinars } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Create a new webinar
router.post('/', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = (req as any).user;
    
    const {
      title,
      description,
      category,
      type,
      language,
      scheduledAt,
      duration,
      maxParticipants,
      coverImage,
    } = req.body;

    // Validate required fields
    if (!title || !scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'Title and scheduledAt are required',
      });
    }

    // Insert webinar
    const [newWebinar] = await db.insert(webinars).values({
      createdById: user.id,
      title,
      description: description || null,
      category: category || null,
      type: type || 'webinar',
      status: 'draft',
      language: language || 'en',
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      maxParticipants: maxParticipants || 10,
      currentParticipants: 0,
      coverImage: coverImage || null,
    });

    res.json({
      success: true,
      webinar: newWebinar,
    });
  } catch (error) {
    console.error('Error creating webinar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create webinar',
    });
  }
});

// Get all webinars
router.get('/', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const allWebinars = await db.select().from(webinars);

    res.json({
      success: true,
      webinars: allWebinars,
    });
  } catch (error) {
    console.error('Error fetching webinars:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webinars',
    });
  }
});

// Get a single webinar by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const webinarId = parseInt(req.params.id);

    const [webinar] = await db
      .select()
      .from(webinars)
      .where(eq(webinars.id, webinarId));

    if (!webinar) {
      return res.status(404).json({
        success: false,
        error: 'Webinar not found',
      });
    }

    res.json({
      success: true,
      webinar,
    });
  } catch (error) {
    console.error('Error fetching webinar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch webinar',
    });
  }
});

// Update a webinar
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);

    // Check if webinar exists and belongs to user
    const [existingWebinar] = await db
      .select()
      .from(webinars)
      .where(eq(webinars.id, webinarId));

    if (!existingWebinar) {
      return res.status(404).json({
        success: false,
        error: 'Webinar not found',
      });
    }

    if (existingWebinar.createdById !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this webinar',
      });
    }

    const {
      title,
      description,
      category,
      type,
      status,
      language,
      scheduledAt,
      duration,
      maxParticipants,
      coverImage,
    } = req.body;

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (language !== undefined) updateData.language = language;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (duration !== undefined) updateData.duration = duration;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    // Update webinar
    await db
      .update(webinars)
      .set(updateData)
      .where(eq(webinars.id, webinarId));

    // Fetch updated webinar
    const [updatedWebinar] = await db
      .select()
      .from(webinars)
      .where(eq(webinars.id, webinarId));

    res.json({
      success: true,
      webinar: updatedWebinar,
    });
  } catch (error) {
    console.error('Error updating webinar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update webinar',
    });
  }
});

// Delete a webinar (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = (req as any).user;
    const webinarId = parseInt(req.params.id);

    // Check if webinar exists and belongs to user
    const [existingWebinar] = await db
      .select()
      .from(webinars)
      .where(eq(webinars.id, webinarId));

    if (!existingWebinar) {
      return res.status(404).json({
        success: false,
        error: 'Webinar not found',
      });
    }

    if (existingWebinar.createdById !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this webinar',
      });
    }

    // Soft delete by setting deletedAt
    await db
      .update(webinars)
      .set({ deletedAt: new Date() })
      .where(eq(webinars.id, webinarId));

    res.json({
      success: true,
      message: 'Webinar deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webinar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete webinar',
    });
  }
});

export default router;
