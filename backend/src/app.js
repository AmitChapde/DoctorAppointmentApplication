const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const systemRoutes = require('./routes/system.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/system', systemRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined,
  });
});

module.exports = app;
