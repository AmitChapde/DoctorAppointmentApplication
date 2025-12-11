import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { UserAPI } from '../../api/endpoints';
import { Doctor, Slot } from '../../api/types';
import { useNavigate } from 'react-router-dom';

export default function SlotSearchPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [from, setFrom] = useState<Dayjs | null>(dayjs().startOf('day'));
  const [to, setTo] = useState<Dayjs | null>(dayjs().add(7, 'day').endOf('day'));
  const [slots, setSlots] = useState<(Slot & { doctor: Doctor; availableSeats: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    UserAPI.listDoctors()
        .then(setDoctors)
      .catch((e) => setError(e.message));
  }, []);

  const search = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (doctorId) params.doctorId = doctorId;
      if (from) params.from = from.toISOString();
      if (to) params.to = to.toISOString();
      const data = await UserAPI.searchSlots(params);
      setSlots(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Search Slots" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
                fullWidth
              >
                <MenuItem value="">All</MenuItem>
                {doctors.map((d) => (
                  <MenuItem value={d.id} key={d.id}>
                    {d.name} {d.specialty ? `— ${d.specialty}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <DateTimePicker label="From" value={from} onChange={setFrom} slotProps={{ textField: { fullWidth: true } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <DateTimePicker label="To" value={to} onChange={setTo} slotProps={{ textField: { fullWidth: true } }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" onClick={search} fullWidth disabled={loading} sx={{ height: '100%' }}>
                {loading ? 'Searching…' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {slots.map((s) => (
          <Grid item xs={12} md={6} lg={4} key={s.id}>
            <Card>
              <CardHeader
                title={s.doctor?.name}
                subheader={s.doctor?.specialty || '—'}
                action={<Chip color="primary" label={`${s.availableSeats} available`} />}
              />
              <CardContent>
                <Typography variant="body2">
                  {dayjs(s.startTime).format('YYYY-MM-DD HH:mm')} → {dayjs(s.endTime).format('YYYY-MM-DD HH:mm')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total seats: {s.totalSeats}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={() => navigate('/book', { state: { slot: s } })}
                  disabled={(s.availableSeats ?? 0) <= 0}
                >
                  Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
