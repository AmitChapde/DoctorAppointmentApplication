const router = require('express').Router();
const controller = require('../controllers/booking.controller');

// Create booking (hold or instant confirm)
// body: { slotId, userId, seats, hold }
router.post('/', controller.createBooking);

// Confirm a pending booking
router.post('/:id/confirm', controller.confirmBooking);

// Get booking by id
router.get('/:id', controller.getBooking);

// Cancel a pending hold (optional helper)
router.post('/:id/cancel', controller.cancelPending);

module.exports = router;
