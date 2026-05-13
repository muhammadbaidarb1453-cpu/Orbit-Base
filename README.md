# OrbitBase — Startup Incubation Management Portal

A full-stack web application for managing the complete lifecycle of startup incubation programs.

## Demo Accounts

| Role     | Email                      | Password     |
|----------|----------------------------|--------------|
| Founder  | founder@orbitbase.com      | founder123   |
| Mentor   | mentor@orbitbase.com       | mentor123    |
| Investor | investor@orbitbase.com     | investor123  |
| Admin    | admin@orbitbase.com        | admin123     |

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL (Supabase / Render)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Real-time**: Socket.io
- **File Upload**: Cloudinary

## Local Development

### 1. Clone and Install

```bash
# Server
cd server
npm install

# Client
cd client
npm install
```

### 2. Set Up Database

Create a PostgreSQL database (locally or on Supabase).

```bash
cd server
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma db push
node src/seed.js
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-backend.onrender.com`

### Backend → Render

1. Create a new Web Service on Render
2. Set root directory to `server`
3. Build command: `npm install && npx prisma generate && npx prisma db push && node src/seed.js`
4. Start command: `npm start`
5. Add environment variables from `.env.example`

## Features

### Startup Founders
- Submit startups with full details and pitch deck upload
- Real-time application status tracking with history
- Request mentorship from available mentors
- View investor meeting requests and confirm them
- Message investors directly

### Mentors
- View pending mentorship requests and accept/decline
- Set milestones for assigned startups (title, description, due date, priority)
- Track and update milestone progress
- Submit structured feedback with star ratings

### Investors
- Browse and filter startups by industry, stage, and category
- View complete startup profiles and pitch decks
- Schedule meetings with founders
- Submit evaluations with comments and star ratings
- Message founders directly

### Admins
- Approve mentor and investor accounts
- Change startup application statuses with audit trail
- View system-wide statistics with charts
- Full audit log of all admin actions
