const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/mentors - list all approved mentors
router.get('/', authenticate, async (req, res) => {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR', isApproved: true, isActive: true },
      select: { id: true, name: true, email: true, bio: true, profilePicture: true, createdAt: true },
    });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentors/my-startups - mentor sees assigned startups
router.get('/my-startups', authenticate, authorize('MENTOR'), async (req, res) => {
  try {
    const mentorships = await prisma.mentorshipRequest.findMany({
      where: { mentorId: req.user.id, status: 'ACCEPTED' },
      include: {
        startup: {
          include: {
            founder: { select: { id: true, name: true, email: true } },
            milestones: { orderBy: { dueDate: 'asc' } },
            _count: { select: { evaluations: true } },
          },
        },
      },
    });
    res.json(mentorships.map((m) => m.startup));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentors/requests - mentor sees pending requests
router.get('/requests', authenticate, authorize('MENTOR'), async (req, res) => {
  try {
    const requests = await prisma.mentorshipRequest.findMany({
      where: { mentorId: req.user.id },
      include: {
        startup: { select: { id: true, name: true, industry: true, fundingStage: true, description: true } },
        founder: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/mentors/request - founder requests a mentor
router.post('/request', authenticate, authorize('FOUNDER'), async (req, res) => {
  try {
    const { mentorId, startupId, message } = req.body;
    if (!mentorId || !startupId) return res.status(400).json({ error: 'mentorId and startupId required' });

    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup || startup.founderId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const existing = await prisma.mentorshipRequest.findFirst({
      where: { mentorId, startupId },
    });
    if (existing) return res.status(409).json({ error: 'Request already sent to this mentor' });

    const request = await prisma.mentorshipRequest.create({
      data: { mentorId, startupId, founderId: req.user.id, message },
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: mentorId,
      type: 'MENTORSHIP_REQUEST',
      title: 'New Mentorship Request',
      message: `${req.user.name} has requested your mentorship for their startup "${startup.name}"`,
      link: '/mentor/requests',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/mentors/request/:id - mentor accepts/declines
router.patch('/request/:id', authenticate, authorize('MENTOR'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'DECLINED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const mentorshipReq = await prisma.mentorshipRequest.findUnique({
      where: { id: req.params.id },
      include: { startup: true },
    });
    if (!mentorshipReq || mentorshipReq.mentorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.mentorshipRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: mentorshipReq.founderId,
      type: 'MENTORSHIP_UPDATE',
      title: `Mentorship Request ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`,
      message: `${req.user.name} has ${status.toLowerCase()} your mentorship request for "${mentorshipReq.startup.name}"`,
      link: `/startups/${mentorshipReq.startupId}`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
