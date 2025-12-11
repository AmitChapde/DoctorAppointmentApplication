const router = require('express').Router();
const controller = require('../controllers/admin.controller');

// Doctor management
router.post('/doctors', controller.createDoctor);
router.get('/doctors', controller.listDoctors);

// Slot management
router.post('/doctors/:doctorId/slots', controller.createSlot);
router.get('/slots', controller.listSlots);

module.exports = router;
