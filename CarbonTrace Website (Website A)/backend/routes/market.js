const express = require('express');
const router = express.Router();

// ─── Auth Routes ────────────────────────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  // Stub — will be implemented in Phase 2
  res.status(501).json({ message: 'Market login not yet implemented — coming in Phase 2' });
});

router.post('/auth/register', (req, res) => {
  res.status(501).json({ message: 'Registration not yet implemented — coming in Phase 2' });
});

// ─── Health check for market routes ─────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', portal: 'marketplace' });
});

module.exports = router;
