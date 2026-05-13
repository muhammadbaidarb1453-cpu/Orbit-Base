const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/startups - list (investors/admins/mentors see all, founders see own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { industry, fundingStage, category, status } = req.query;
    const where = {};
    if (industry) where.industry = industry;
    if (fundingStage) where.fundingStage = fundingStage;
    if (category) where.category = category;
    if (status) where.status = status;
    if (req.user.role === 'FOUNDER') where.founderId = req.user.id;

    const startups = await prisma.startup.findMany({
      where,
      include: {
        founder: { select: { id: true, name: true, email: true, profilePicture: true } },
        evaluations: { include: { reviewer: { select: { id: true, name: true, role: true } } } },
        _count: { select: { milestones: true, meetings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(startups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/startups/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: req.params.id },
      include: {
        founder: { select: { id: true, name: true, email: true, bio: true, profilePicture: true } },
        statusHistory: { orderBy: { changedAt: 'desc' } },
        evaluations: { include: { reviewer: { select: { id: true, name: true, role: true } } } },
        mentorships: { include: { mentor: { select: { id: true, name: true, bio: true, profilePicture: true } } } },
        milestones: { orderBy: { dueDate: 'asc' } },
        meetings: { include: { investor: { select: { id: true, name: true } } }, orderBy: { scheduledAt: 'asc' } },
      },
    });
    if (!startup) return res.status(404).json({ error: 'Startup not found' });
    if (req.user.role === 'FOUNDER' && startup.founderId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/startups - founder submits startup
router.post('/', authenticate, authorize('FOUNDER'), async (req, res) => {
  try {
    const { name, description, industry, fundingStage, category, location, website } = req.body;
    if (!name || !description || !industry || !fundingStage) {
      return res.status(400).json({ error: 'Name, description, industry, and funding stage are required' });
    }
    const startup = await prisma.startup.create({
      data: {
        name, description, industry, fundingStage, category, location, website,
        founderId: req.user.id,
      },
    });
    await prisma.statusHistory.create({
      data: { startupId: startup.id, status: 'PENDING', note: 'Startup submitted' },
    });
    res.status(201).json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/startups/:id - founder updates startup
router.put('/:id', authenticate, authorize('FOUNDER'), async (req, res) => {
  try {
    const startup = await prisma.startup.findUnique({ where: { id: req.params.id } });
    if (!startup || startup.founderId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { name, description, industry, fundingStage, category, location, website } = req.body;
    const updated = await prisma.startup.update({
      where: { id: req.params.id },
      data: { name, description, industry, fundingStage, category, location, website },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/startups/:id/pitch-deck - upload pitch deck
router.post('/:id/pitch-deck', authenticate, authorize('FOUNDER'), upload.single('pitchDeck'), async (req, res) => {
  try {
    const startup = await prisma.startup.findUnique({ where: { id: req.params.id } });
    if (!startup || startup.founderId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let url, name;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
      const result = await uploadToCloudinary(req.file.buffer, 'orbitbase/pitch-decks');
      url = result.secure_url;
      name = req.file.originalname;
    } else {
      // Fallback: store as base64 data URL for demo
      url = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      name = req.file.originalname;
    }

    const updated = await prisma.startup.update({
      where: { id: req.params.id },
      data: { pitchDeckUrl: url, pitchDeckName: name },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/startups/:id/status - admin changes status
router.patch('/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const startup = await prisma.startup.update({
      where: { id: req.params.id },
      data: { status },
      include: { founder: true },
    });
    await prisma.statusHistory.create({
      data: { startupId: startup.id, status, note: note || `Status changed to ${status}` },
    });

    const io = req.app.get('io');
    await createNotification(io, {
      userId: startup.founderId,
      type: 'STATUS_UPDATE',
      title: 'Application Status Updated',
      message: `Your startup "${startup.name}" status changed to ${status.replace('_', ' ')}`,
      link: `/startups/${startup.id}`,
    });

    res.json(startup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/startups/:id/evaluate - mentor/investor/admin evaluates
router.post('/:id/evaluate', authenticate, authorize('MENTOR', 'INVESTOR', 'ADMIN'), async (req, res) => {
  try {
    const { rating, comments } = req.body;
    if (!rating || !comments) return res.status(400).json({ error: 'Rating and comments required' });
    const evaluation = await prisma.evaluation.create({
      data: {
        rating: Number(rating),
        comments,
        startupId: req.params.id,
        reviewerId: req.user.id,
      },
      include: { reviewer: { select: { id: true, name: true, role: true } } },
    });

    const startup = await prisma.startup.findUnique({ where: { id: req.params.id } });
    const io = req.app.get('io');
    await createNotification(io, {
      userId: startup.founderId,
      type: 'EVALUATION',
      title: 'New Evaluation Received',
      message: `${req.user.name} has submitted an evaluation for your startup "${startup.name}"`,
      link: `/startups/${req.params.id}`,
    });

    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
