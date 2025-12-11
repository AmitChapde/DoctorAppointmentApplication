const router = require('express').Router();

router.get('/health', async (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.get('/version', (req, res) => {
  res.json({ name: 'doctor-appointment-booking', version: '1.0.0' });
});

module.exports = router;
