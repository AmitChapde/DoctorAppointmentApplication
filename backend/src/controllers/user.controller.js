const { prisma } = require('../prisma/client');
const dayjs = require('dayjs');

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

// GET /users/slots?doctorId=&from=&to=
exports.searchSlots = async (req, res, next) => {
  try {
    const { doctorId, from, to } = req.query;

    const where = {};
    if (doctorId) where.doctorId = parseInt(doctorId, 10);
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = dayjs(from).toDate();
      if (to) where.startTime.lte = dayjs(to).toDate();
    }

    const slots = await prisma.slot.findMany({
      where,
      include: { doctor: true },
      orderBy: [{ startTime: 'asc' }],
    });

    // Compute availability per slot
    const slotIds = slots.map(s => s.id);
    if (slotIds.length === 0) return res.json([]);

    const [confirmed, pending] = await Promise.all([
      prisma.appointment.groupBy({
        by: ['slotId'],
        where: { slotId: { in: slotIds }, status: 'CONFIRMED' },
        _sum: { seats: true },
      }),
      prisma.appointment.groupBy({
        by: ['slotId'],
        where: {
          slotId: { in: slotIds },
          status: 'PENDING',
          expiresAt: { gt: new Date() },
        },
        _sum: { seats: true },
      }),
    ]);

    const confirmedMap = new Map(confirmed.map(x => [x.slotId, x._sum.seats || 0]));
    const pendingMap = new Map(pending.map(x => [x.slotId, x._sum.seats || 0]));

    const result = slots.map(s => {
      const c = confirmedMap.get(s.id) || 0;
      const p = pendingMap.get(s.id) || 0;
      const available = Math.max(0, s.totalSeats - c - p);
      return { ...s, availableSeats: available };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
