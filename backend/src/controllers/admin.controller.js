const { prisma } = require('../prisma/client');
const dayjs = require('dayjs');

exports.createDoctor = async (req, res, next) => {
  try {
    const { name, specialty } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const doctor = await prisma.doctor.create({
      data: { name, specialty: specialty || null },
    });
    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.listDoctors = async (req, res, next) => {
  try {
    const docs = await prisma.doctor.findMany({
      orderBy: [{ name: 'asc' }],
    });
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

exports.createSlot = async (req, res, next) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    const { startTime, endTime, totalSeats } = req.body;

    if (!doctorId || !startTime || !endTime || !totalSeats)
      return res.status(400).json({ error: 'doctorId, startTime, endTime, totalSeats are required' });

    const start = dayjs(startTime);
    const end = dayjs(endTime);
    if (!start.isValid() || !end.isValid() || !end.isAfter(start))
      return res.status(400).json({ error: 'Invalid start/end time' });

    const slot = await prisma.slot.create({
      data: {
        doctorId,
        startTime: start.toDate(),
        endTime: end.toDate(),
        totalSeats: parseInt(totalSeats, 10),
      },
    });

    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
};

exports.listSlots = async (req, res, next) => {
  try {
    const slots = await prisma.slot.findMany({
      include: { doctor: true },
      orderBy: [{ startTime: 'asc' }],
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
};
