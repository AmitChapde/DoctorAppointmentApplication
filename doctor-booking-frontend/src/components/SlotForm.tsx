import { useState } from 'react';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Doctor } from '../api/types';

export default function SlotForm({
  doctors,
  onCreate,
}: {
  doctors: Doctor[];
  onCreate: (doctorId: number, startISO: string, endISO: string, totalSeats: number) => Promise<void>;
 }) {
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [start, setStart] = useState<Dayjs | null>(dayjs().minute(0).second(0).millisecond(0));
  const [end, setEnd] = useState<Dayjs | null>(dayjs().add(30, 'minute').second(0).millisecond(0));
  const [seats, setSeats] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !start || !end || seats <= 0) return;
    setLoading(true);
    try {
      await onCreate(Number(doctorId), start.toISOString(), end.toISOString(), Number(seats));
      setSeats(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
 <TextField
              select
              label="Doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(Number(e.target.value))}
              fullWidth
              required
            >
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name} {d.specialty ? `— ${d.specialty}` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <DateTimePicker label="Start Time" value={start} onChange={setStart} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <DateTimePicker label="End Time" value={end} onChange={setEnd} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              type="number"
              label="Total Seats"
              value={seats}
              onChange={(e) => setSeats(parseInt(e.target.value || '0', 10))}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Saving…' : 'Add'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
