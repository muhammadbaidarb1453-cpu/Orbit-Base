require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OrbitBase...');

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw) => bcrypt.hash(pw, 10);

  // Create users
  const [admin, founder1, founder2, mentor1, investor1] = await Promise.all([
    prisma.user.create({ data: { name: 'Admin User', email: 'admin@orbitbase.com', password: await hash('admin123'), role: 'ADMIN', isApproved: true, bio: 'System administrator for OrbitBase.' } }),
    prisma.user.create({ data: { name: 'Mehkaan Khan', email: 'founder@orbitbase.com', password: await hash('founder123'), role: 'FOUNDER', isApproved: true, bio: 'Serial entrepreneur passionate about EdTech and FinTech solutions.' } }),
    prisma.user.create({ data: { name: 'Sara Ahmed', email: 'founder2@orbitbase.com', password: await hash('founder123'), role: 'FOUNDER', isApproved: true, bio: 'HealthTech founder with a background in biomedical engineering.' } }),
    prisma.user.create({ data: { name: 'Dr. Usman Malik', email: 'mentor@orbitbase.com', password: await hash('mentor123'), role: 'MENTOR', isApproved: true, bio: 'Former CTO at TechCorp Pakistan. 15+ years in product development and startup mentorship.' } }),
    prisma.user.create({ data: { name: 'Zara Investments', email: 'investor@orbitbase.com', password: await hash('investor123'), role: 'INVESTOR', isApproved: true, bio: 'Angel investor with portfolio across EdTech, HealthTech, and FinTech sectors in South Asia.' } }),
  ]);

  // Founder 1 startups
  const startup1 = await prisma.startup.create({
    data: {
      name: 'EduLeap',
      description: 'An AI-powered adaptive learning platform for K-12 students in Pakistan, personalizing curriculum based on each student\'s learning pace and style. We\'ve already onboarded 3 pilot schools with 500+ active students.',
      industry: 'EdTech',
      fundingStage: 'Seed',
      category: 'Education',
      location: 'Lahore, Pakistan',
      website: 'https://eduleap.pk',
      status: 'UNDER_REVIEW',
      founderId: founder1.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      { startupId: startup1.id, status: 'PENDING', note: 'Startup submitted', changedAt: new Date('2025-04-01') },
      { startupId: startup1.id, status: 'UNDER_REVIEW', note: 'Application moved to review phase by admin', changedAt: new Date('2025-04-10') },
    ],
  });

  const startup2 = await prisma.startup.create({
    data: {
      name: 'PayEase',
      description: 'A mobile-first payment gateway designed for SMEs in rural Pakistan, enabling QR-based payments with zero smartphone requirement on the merchant side.',
      industry: 'FinTech',
      fundingStage: 'Pre-Seed',
      category: 'Financial Services',
      location: 'Karachi, Pakistan',
      status: 'SHORTLISTED',
      founderId: founder1.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      { startupId: startup2.id, status: 'PENDING', note: 'Startup submitted' },
      { startupId: startup2.id, status: 'UNDER_REVIEW', note: 'Under review' },
      { startupId: startup2.id, status: 'SHORTLISTED', note: 'Shortlisted for final evaluation' },
    ],
  });

  // Founder 2 startup
  const startup3 = await prisma.startup.create({
    data: {
      name: 'MediScan',
      description: 'AI-driven diagnostic tool for early detection of diabetic retinopathy using smartphone cameras. Targeting tier-2 and tier-3 cities with limited specialist access.',
      industry: 'HealthTech',
      fundingStage: 'Seed',
      category: 'Healthcare',
      location: 'Islamabad, Pakistan',
      status: 'ACCEPTED',
      founderId: founder2.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      { startupId: startup3.id, status: 'PENDING', note: 'Startup submitted' },
      { startupId: startup3.id, status: 'UNDER_REVIEW', note: 'Under review' },
      { startupId: startup3.id, status: 'SHORTLISTED', note: 'Shortlisted' },
      { startupId: startup3.id, status: 'ACCEPTED', note: 'Accepted into incubation program!' },
    ],
  });

  // Evaluations
  await prisma.evaluation.createMany({
    data: [
      { rating: 4, comments: 'Strong market fit for Pakistani education sector. Team execution looks promising. Recommend moving to next stage.', startupId: startup1.id, reviewerId: mentor1.id },
      { rating: 5, comments: 'Exceptional product-market fit. The pilot data is compelling. This is exactly the kind of innovation we want to invest in.', startupId: startup2.id, reviewerId: investor1.id },
      { rating: 5, comments: 'Outstanding. The AI diagnostic accuracy numbers are impressive and the go-to-market strategy is well thought out.', startupId: startup3.id, reviewerId: investor1.id },
    ],
  });

  // Mentorship
  const mentorship = await prisma.mentorshipRequest.create({
    data: {
      status: 'ACCEPTED',
      message: 'We would love guidance on scaling our technology infrastructure.',
      startupId: startup1.id,
      mentorId: mentor1.id,
      founderId: founder1.id,
    },
  });

  // Milestones
  await prisma.milestone.createMany({
    data: [
      {
        title: 'Complete MVP v2.0',
        description: 'Launch the second version with adaptive quiz engine and teacher dashboard.',
        dueDate: new Date('2025-07-01'),
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startupId: startup1.id,
        mentorId: mentor1.id,
      },
      {
        title: 'Onboard 10 Schools',
        description: 'Expand pilot program from 3 to 10 schools across Punjab.',
        dueDate: new Date('2025-09-01'),
        status: 'NOT_STARTED',
        priority: 'HIGH',
        startupId: startup1.id,
        mentorId: mentor1.id,
      },
      {
        title: 'Achieve Product-Market Fit Metrics',
        description: 'Reach 70% weekly active usage among enrolled students.',
        dueDate: new Date('2025-08-15'),
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        startupId: startup1.id,
        mentorId: mentor1.id,
      },
    ],
  });

  // Meetings
  await prisma.meeting.create({
    data: {
      title: 'Investment Discussion - EduLeap',
      scheduledAt: new Date('2025-06-15T10:00:00Z'),
      duration: 60,
      confirmed: true,
      notes: 'Discuss Series A terms and product roadmap.',
      investorId: investor1.id,
      founderId: founder1.id,
      startupId: startup1.id,
    },
  });

  await prisma.meeting.create({
    data: {
      title: 'Due Diligence Meeting - PayEase',
      scheduledAt: new Date('2025-06-20T14:00:00Z'),
      duration: 45,
      confirmed: false,
      investorId: investor1.id,
      founderId: founder1.id,
      startupId: startup2.id,
    },
  });

  // Messages
  await prisma.message.createMany({
    data: [
      { senderId: investor1.id, receiverId: founder1.id, content: 'Hi Mehkaan! Loved your EduLeap pitch. Would love to discuss potential investment.', createdAt: new Date('2025-05-10T09:00:00Z') },
      { senderId: founder1.id, receiverId: investor1.id, content: 'Thank you so much! We\'d be thrilled to connect. When are you available?', createdAt: new Date('2025-05-10T09:30:00Z') },
      { senderId: investor1.id, receiverId: founder1.id, content: 'How about June 15th at 10am? I can share my calendar invite.', createdAt: new Date('2025-05-10T10:00:00Z') },
      { senderId: founder1.id, receiverId: investor1.id, content: 'Perfect! June 15th works great. Looking forward to it!', createdAt: new Date('2025-05-10T10:15:00Z') },
    ],
  });

  // Audit logs
  await prisma.auditLog.create({
    data: { action: 'STATUS_CHANGE', details: 'Changed EduLeap status to UNDER_REVIEW', adminId: admin.id },
  });
  await prisma.auditLog.create({
    data: { action: 'APPROVE_USER', details: 'Approved mentor Dr. Usman Malik', adminId: admin.id },
  });
  await prisma.auditLog.create({
    data: { action: 'APPROVE_USER', details: 'Approved investor Zara Investments', adminId: admin.id },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: founder1.id, type: 'STATUS_UPDATE', title: 'Application Under Review', message: 'Your startup "EduLeap" is now under review. Hang tight!', read: true },
      { userId: founder1.id, type: 'MENTORSHIP_UPDATE', title: 'Mentorship Accepted', message: 'Dr. Usman Malik has accepted your mentorship request for EduLeap.', read: false },
      { userId: founder1.id, type: 'MESSAGE', title: 'New Message from Zara Investments', message: 'Loved your EduLeap pitch. Would love to discuss potential investment.', read: false },
      { userId: mentor1.id, type: 'MENTORSHIP_REQUEST', title: 'New Mentorship Request', message: 'Mehkaan Khan has requested your mentorship for EduLeap.', read: true },
      { userId: investor1.id, type: 'MEETING_CONFIRMED', title: 'Meeting Confirmed', message: 'Mehkaan Khan confirmed your meeting for June 15th.', read: false },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin:    admin@orbitbase.com / admin123');
  console.log('  Founder:  founder@orbitbase.com / founder123');
  console.log('  Founder2: founder2@orbitbase.com / founder123');
  console.log('  Mentor:   mentor@orbitbase.com / mentor123');
  console.log('  Investor: investor@orbitbase.com / investor123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
