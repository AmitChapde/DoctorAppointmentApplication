const router = require('express').Router();
const controller = require('../controllers/user.controller');

// Public listings
router.get('/doctors', controller.listDoctors);
router.get('/slots', controller.searchSlots); // ?doctorId=&from=&to=

module.exports = router;
