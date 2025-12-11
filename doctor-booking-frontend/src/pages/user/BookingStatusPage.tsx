import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { BookingAPI } from '../../api/endpoints';
import { Appointment } from '../../api/types';

export default function BookingStatusPage() {
  const location = useLocation();
  const initialId = location.state?.id || '';

  const [bookingId, setBookingId] = useState<string>(initialId);
  const [booking, setBooking] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBooking = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    try {
      const data = await BookingAPI.getBooking(id.trim());
      setBooking(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchBooking(initialId);
    }
  }, [initialId]);

  const handleSearch = () => {
    fetchBooking(bookingId);
  };

  const confirm = async () => {
    if (!booking) return;
    try {
      const updated = await BookingAPI.confirmBooking(booking.id);
      setBooking(updated);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const cancel = async () => {
    if (!booking) return;
    try {
      const updated = await BookingAPI.cancelPending(booking.id);
      setBooking(updated);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Check Booking Status" />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID to check status"
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading || !bookingId.trim()}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {booking && (
        <Card>
          <CardHeader 
            title="Booking Details" 
            action={
              <Chip 
                label={booking.status} 
                color={getStatusColor(booking.status) as any}
                variant="filled"
              />
            }
          />
          <CardContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1"><strong>ID:</strong> {booking.id}</Typography>
              <Typography variant="body1"><strong>Slot ID:</strong> {booking.slotId}</Typography>
              <Typography variant="body1"><strong>User ID:</strong> {booking.userId}</Typography>
              <Typography variant="body1"><strong>Seats:</strong> {booking.seats}</Typography>
              <Typography variant="body1"><strong>Created:</strong> {dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Typography>
              {booking.expiresAt && (
                <Typography variant="body1" color={dayjs(booking.expiresAt).isBefore(dayjs()) ? 'error' : 'warning.main'}>
                  <strong>Expires:</strong> {dayjs(booking.expiresAt).format('YYYY-MM-DD HH:mm:ss')}
                  {dayjs(booking.expiresAt).isBefore(dayjs()) && ' (EXPIRED)'}
                </Typography>
              )}
            </Box>

            {booking.status === 'PENDING' && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button variant="contained" color="success" onClick={confirm}>
                  Confirm Booking
                </Button>
                <Button variant="outlined" color="error" onClick={cancel}>
                  Cancel Booking
                </Button>
              </Box>
            )}

            {booking.status === 'CONFIRMED' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Your booking is confirmed! Please arrive on time for your appointment.
              </Alert>
            )}

            {booking.status === 'FAILED' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                This booking has failed or been cancelled. Please create a new booking if needed.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </>
  );
}
