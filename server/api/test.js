module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    hasDb: !!process.env.DATABASE_URL,
    hasJwt: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  }));
};
