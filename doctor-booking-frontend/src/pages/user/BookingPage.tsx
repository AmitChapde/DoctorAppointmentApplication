import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  Alert,
 Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { BookingAPI } from '../../api/endpoints';
import { Appointment, Slot } from '../../api/types';

export default function BookingPage() {
  const location = useLocation();
  const nav = useNavigate();
  const slot: (Slot & any) | undefined = location.state?.slot;
  const [userId, setUserId] = useState<string>('');
  const [seats, setSeats] = useState<number>(1);
  const [hold, setHold] = useState<boolean>(true);
  const [result, setResult] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const available = useMemo(() => Number(slot?.availableSeats ?? 0), [slot]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) {
      setError('No slot selected');
      return;
 }
    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }
    if (seats <= 0) {
      setError('Seats must be > 0');
      return;
    }
    try {
      const appt = await BookingAPI.createBooking({
        slotId: slot.id,
        userId: userId.trim(),
        seats,
        hold,
      });
      setResult(appt);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const confirm = async () => {
    if (!result) return;
    try {
      const updated = await BookingAPI.confirmBooking(result.id);
      setResult(updated);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const cancelPending = async () => {
    if (!result) return;
    try {
      const updated = await BookingAPI.cancelPending(result.id);
      setResult(updated);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Create Booking" />
        <CardContent>
          {slot ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Slot</Typography>
              <Typography variant="body2">
                {dayjs(slot.startTime).format('YYYY-MM-DD HH:mm')} → {dayjs(slot.endTime).format('YYYY-MM-DD HH:mm')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available seats: {available} / Total: {slot.totalSeats}
              </Typography>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No slot selected. Go to Browse Slots and pick one.
            </Alert>
          )}

          <Box component="form" onSubmit={submit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="User ID (email or uuid)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  type="number"
                  label="Seats"
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value || '0', 10))}
                  fullWidth
                  inputProps={{ min: 1, max: Math.max(1, available) }}
                />
              </Grid>
              <Grid item xs={12} md={3} display="flex" alignItems="center">
                <FormControlLabel
                  control={<Switch checked={hold} onChange={(e) => setHold(e.target.checked)} />}
                  label="Hold before confirm"
                />
              </Grid>
                <Grid item xs={12} md={3}>
                  <Button type="submit" variant="contained" fullWidth disabled={!slot}>
                    Create Booking
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader title="Booking Result" />
            <CardContent>
              <Typography variant="body2">ID: {result.id}</Typography>
              <Typography variant="body2">Status: {result.status}</Typography>
              <Typography variant="body2">Seats: {result.seats}</Typography>
              {result.expiresAt ? (
                <Typography variant="body2" color="warning.main">
                  Hold expires at: {dayjs(result.expiresAt).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
              ) : null}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={() => nav('/booking', { state: { id: result.id } })}>
                  View Status
                </Button>
                {result.status === 'PENDING' && (
                  <>
                    <Button variant="contained" color="success" onClick={confirm}>
                      Confirm Booking
                    </Button>
                    <Button variant="outlined" color="error" onClick={cancelPending}>
                      Cancel Hold
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      </>
    );
  }

