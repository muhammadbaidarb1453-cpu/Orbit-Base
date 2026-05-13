const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (io, { userId, type, title, message, link }) => {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
  return notification;
};

module.exports = { createNotification };
