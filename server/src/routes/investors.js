const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/investors - list approved investors
router.get('/', authenticate, async (req, res) => {
  try {
    const investors = await prisma.user.findMany({
      where: { role: 'INVESTOR', isApproved: true, isActive: true },
      select: { id: true, name: true, email: true, bio: true, profilePicture: true },
    });
    res.json(investors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
