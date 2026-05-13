const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/milestones/startup/:startupId
router.get('/startup/:startupId', authenticate, async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { startupId: req.params.startupId },
      include: { mentor: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
    });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/milestones - mentor creates milestone
router.post('/', authenticate, authorize('MENTOR'), async (req, res) => {
  try {
    const { title, description, dueDate, priority, startupId } = req.body;
    if (!title || !dueDate || !startupId) return res.status(400).json({ error: 'title, dueDate, startupId required' });

    const milestone = await prisma.milestone.create({
      data: {
        title, description, dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        startupId, mentorId: req.user.id,
      },
    });

    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    const io = req.app.get('io');
    await createNotification(io, {
      userId: startup.founderId,
      type: 'MILESTONE',
      title: 'New Milestone Set',
      message: `${req.user.name} has set a new milestone: "${title}" for your startup`,
      link: `/startups/${startupId}`,
    });

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/milestones/:id - update milestone status
router.patch('/:id', authenticate, authorize('MENTOR'), async (req, res) => {
  try {
    const { status, title, description, dueDate, priority } = req.body;
    const milestone = await prisma.milestone.findUnique({ where: { id: req.params.id } });
    if (!milestone || milestone.mentorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.milestone.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
      },
    });

    const startup = await prisma.startup.findUnique({ where: { id: milestone.startupId } });
    if (status) {
      const io = req.app.get('io');
      await createNotification(io, {
        userId: startup.founderId,
        type: 'MILESTONE_UPDATE',
        title: 'Milestone Updated',
        message: `Milestone "${milestone.title}" is now ${status.replace('_', ' ')}`,
        link: `/startups/${milestone.startupId}`,
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
