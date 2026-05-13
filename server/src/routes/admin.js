const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/admin/users - all users
router.get('/users', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isApproved: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    const io = req.app.get('io');
    await createNotification(io, {
      userId: user.id,
      type: 'ACCOUNT_APPROVED',
      title: 'Account Approved',
      message: 'Your account has been approved by the administrator. You now have full access.',
      link: '/dashboard',
    });
    await prisma.auditLog.create({
      data: { action: 'APPROVE_USER', details: `Approved user ${user.email} (${user.role})`, adminId: req.user.id },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/deactivate
router.patch('/users/:id/deactivate', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    await prisma.auditLog.create({
      data: { action: 'DEACTIVATE_USER', details: `Deactivated user ${user.email}`, adminId: req.user.id },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['FOUNDER', 'MENTOR', 'INVESTOR', 'ADMIN'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await prisma.auditLog.create({
      data: { action: 'CHANGE_ROLE', details: `Changed ${user.email} role to ${role}`, adminId: req.user.id },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats - dashboard stats
router.get('/stats', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [totalUsers, totalStartups, pendingApprovals, statusBreakdown] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.startup.count(),
      prisma.user.count({ where: { isApproved: false, role: { in: ['MENTOR', 'INVESTOR'] } } }),
      prisma.startup.groupBy({ by: ['status'], _count: { status: true } }),
    ]);
    res.json({ totalUsers, totalStartups, pendingApprovals, statusBreakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
