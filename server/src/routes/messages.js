const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { createNotification } = require('../helpers/notify');

const prisma = new PrismaClient();

// GET /api/messages/:userId - conversation between current user and userId
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, profilePicture: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    // Mark received messages as read
    await prisma.message.updateMany({
      where: { senderId: req.params.userId, receiverId: req.user.id, read: false },
      data: { read: true },
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages - all conversations (unique senders/receivers)
router.get('/', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, profilePicture: true, role: true } },
        receiver: { select: { id: true, name: true, profilePicture: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build conversation list (unique other users)
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const other = msg.senderId === req.user.id ? msg.receiver : msg.sender;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({ user: other, lastMessage: msg });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages - send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ error: 'receiverId and content required' });

    const message = await prisma.message.create({
      data: { senderId: req.user.id, receiverId, content },
      include: { sender: { select: { id: true, name: true, profilePicture: true } } },
    });

    const io = req.app.get('io');
    io.to(`user:${receiverId}`).emit('message', message);
    await createNotification(io, {
      userId: receiverId,
      type: 'MESSAGE',
      title: 'New Message',
      message: `${req.user.name}: ${content.slice(0, 60)}${content.length > 60 ? '...' : ''}`,
      link: `/messages/${req.user.id}`,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
