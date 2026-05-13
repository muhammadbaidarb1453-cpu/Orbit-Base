let app;
try {
  app = require('../src/index');
} catch (e) {
  app = (req, res) => {
    res.status(500).json({ error: e.message, type: e.constructor.name });
  };
}
module.exports = app;
