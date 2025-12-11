    const { prisma } = require('../prisma/client');

const HOLD_SECONDS = parseInt(process.env.BOOKING_HOLD_SECONDS || '120', 10);

// Helper to compute current availability inside a transaction with row lock
async function getAvailability(tx, slotId) {
  // Lock the slot row pessimistically to serialize competing writers
  const locked = await tx.$queryRaw`
    SELECT id, "totalSeats" FROM "Slot" WHERE id = ${slotId} FOR UPDATE
  `;
  if (!locked || !locked[0]) {
    const err = new Error('Slot not found');
    err.status = 404;
    throw err;
  }
  const totalSeats = Number(locked[0].totalSeats);

  const confirmed = await tx.$queryRaw`
    SELECT COALESCE(SUM("seats"), 0)::int AS sum
    FROM "Appointment"
    WHERE "slotId" = ${slotId} AND "status" = 'CONFIRMED'
  `;
  const pending = await tx.$queryRaw`
    SELECT COALESCE(SUM("seats"), 0)::int AS sum
    FROM "Appointment"
    WHERE "slotId" = ${slotId} AND "status" = 'PENDING' AND "expiresAt" > NOW()
  `;

  const confirmedSeats = Number(confirmed[0]?.sum || 0);
  const pendingSeats = Number(pending[0]?.sum || 0);
  const available = totalSeats - confirmedSeats - pendingSeats;

  return { totalSeats, confirmedSeats, pendingSeats, available: Math.max(0, available) };
}

async function createBooking({ slotId, userId, seats, hold = false }) {
  if (seats <= 0) {
    const err = new Error('seats must be > 0');
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const { available } = await getAvailability(tx, slotId);
    if (seats > available) {
      const err = new Error('Insufficient seats available');
      err.status = 409;
      throw err;
    }

    const data = {
      slotId,
      userId,
      seats,
      status: hold ? 'PENDING' : 'CONFIRMED',
      expiresAt: hold ? new Date(Date.now() + HOLD_SECONDS * 1000) : null,
    };

    const created = await tx.appointment.create({ data });
    return created;
  }, { timeout: 15000 });
}

async function confirmBooking(appointmentId) {
  return prisma.$transaction(async (tx) => {
    // Lock the appointment row for update
    const rows = await tx.$queryRaw`
      SELECT * FROM "Appointment" WHERE id = ${appointmentId} FOR UPDATE
    `;
    const appt = rows[0];
    if (!appt) {
      const err = new Error('Appointment not found');
      err.status = 404;
      throw err;
    }
    if (appt.status === 'CONFIRMED') return appt;
    if (appt.status === 'FAILED') {
      const err = new Error('Appointment already failed');
      err.status = 409;
      throw err;
    }
    if (appt.status !== 'PENDING') {
      const err = new Error('Only PENDING appointments can be confirmed');
      err.status = 409;
      throw err;
    }
    if (appt.expiresAt && new Date(appt.expiresAt) <= new Date()) {
      // mark failed if already expired
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'FAILED' },
      });
      const err = new Error('Hold expired');
      err.status = 410;
      err.details = updated;
      throw err;
    }

    // Optionally recheck slot lock to keep counts consistent
    await tx.$queryRaw`SELECT id FROM "Slot" WHERE id = ${appt.slotId} FOR UPDATE`;

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED', expiresAt: null },
    });
    return updated;
  }, { timeout: 15000 });
}

async function getBooking(id) {
  return prisma.appointment.findUnique({ where: { id } });
}

async function cancelPending(id) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      SELECT * FROM "Appointment" WHERE id = ${id} FOR UPDATE
    `;
    const appt = rows[0];
    if (!appt) {
      const err = new Error('Appointment not found');
      err.status = 404;
      throw err;
    }
    if (appt.status !== 'PENDING') {
      const err = new Error('Only PENDING appointments can be cancelled');
      err.status = 409;
      throw err;
    }
    const updated = await tx.appointment.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    return updated;
  });
}

// Background worker to expire pending holds older than HOLD_SECONDS
function startExpiryWorker() {
  const intervalMs = 30000; // every 30 seconds
  setInterval(async () => {
    try {
      const result = await prisma.$executeRaw`
        UPDATE "Appointment"
        SET "status" = 'FAILED'
        WHERE "status" = 'PENDING' AND "expiresAt" <= NOW()
      `;
      if (result > 0) {
        console.log(`[ExpiryWorker] Marked ${result} pending bookings as FAILED`);
      }
    } catch (e) {
      console.error('[ExpiryWorker] error', e);
    }
  }, intervalMs);
}

module.exports = {
  createBooking,
  confirmBooking,
  getBooking,
  cancelPending,
  startExpiryWorker,
};
