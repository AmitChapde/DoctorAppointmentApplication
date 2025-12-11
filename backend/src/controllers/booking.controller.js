const service = require('../services/booking.service');

exports.createBooking = async (req, res, next) => {
  try {
    const { slotId, userId, seats, hold } = req.body;
    if (!slotId || !userId || !seats)
      return res.status(400).json({ error: 'slotId, userId, seats are required' });

    const booking = await service.createBooking({
      slotId: parseInt(slotId, 10),
      userId: String(userId),
      seats: parseInt(seats, 10),
      hold: Boolean(hold),
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const id = req.params.id;
    const booking = await service.confirmBooking(id);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const id = req.params.id;
    const booking = await service.getBooking(id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.cancelPending = async (req, res, next) => {
  try {
    const id = req.params.id;
    const booking = await service.cancelPending(id);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
