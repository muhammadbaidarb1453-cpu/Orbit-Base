require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const startupRoutes = require('./routes/startups');
const mentorRoutes = require('./routes/mentors');
const investorRoutes = require('./routes/investors');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const milestoneRoutes = require('./routes/milestones');
const meetingRoutes = require('./routes/meetings');

const app = express();

const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').trim();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());

if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket.io only outside Vercel (serverless can't hold persistent connections)
if (!process.env.VERCEL) {
  const http = require('http');
  const { Server } = require('socket.io');
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  app.set('io', io);
  io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(`user:${userId}`));
    socket.on('disconnect', () => {});
  });
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`OrbitBase server running on port ${PORT}`);
  });
}

module.exports = app;
