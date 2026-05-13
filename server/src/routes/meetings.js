const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/meetings - get meetings for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const where =
      req.user.role === 'INVESTOR'
        ? { investorId: req.user.id }
        : req.user.role === 'FOUNDER'
        ? { founderId: req.user.id }
        : {};
    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        investor: { select: { id: true, name: true, email: true } },
        founder: { select: { id: true, name: true, email: true } },
        startup: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings - investor schedules a meeting
router.post('/', authenticate, authorize('INVESTOR'), async (req, res) => {
  try {
    const { title, scheduledAt, duration, notes, founderId, startupId } = req.body;
    if (!title || !scheduledAt || !founderId || !startupId) {
      return res.status(400).json({ error: 'title, scheduledAt, founderId, startupId required' });
    }
    const meeting = await prisma.meeting.create({
      data: {
        title, scheduledAt: new Date(scheduledAt),
        duration: duration || 30, notes,
        investorId: req.user.id, founderId, startupId,
      },
      include: {
        investor: { select: { id: true, name: true } },
        startup: { select: { id: true, name: true } },
      },
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: founderId,
      type: 'MEETING',
      title: 'Meeting Request',
      message: `${req.user.name} wants to schedule a meeting about "${meeting.startup.name}"`,
      link: '/founder/meetings',
    });

    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meetings/:id/confirm - founder confirms meeting
router.patch('/:id/confirm', authenticate, authorize('FOUNDER'), async (req, res) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!meeting || meeting.founderId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.meeting.update({
      where: { id: req.params.id },
      data: { confirmed: true },
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: meeting.investorId,
      type: 'MEETING_CONFIRMED',
      title: 'Meeting Confirmed',
      message: `${req.user.name} has confirmed your meeting request`,
      link: '/investor/meetings',
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
