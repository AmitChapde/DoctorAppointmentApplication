import { useEffect, useState } from 'react';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { AdminAPI } from '../../api/endpoints';
import { Doctor, Slot } from '../../api/types';
import SlotForm from '../../components/SlotForm';
import dayjs from 'dayjs';

export default function SlotsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<(Slot & { doctor: Doctor })[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [docs, slts] = await Promise.all([AdminAPI.listDoctors(), AdminAPI.listSlots()]);
      setDoctors(docs);
      setSlots(slts);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (doctorId: number, startISO: string, endISO: string, totalSeats: number) => {
    try {
      await AdminAPI.createSlot(doctorId, { startTime: startISO, endTime: endISO, totalSeats });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Add Slot" />
        <CardContent>
          <SlotForm doctors={doctors} onCreate={onCreate} />
        </CardContent>
 </Card>

      <Card>
        <CardHeader title="All Slots" />
        <Divider />
        <CardContent sx={{ px: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Total Seats</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slots.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>
                    {s.doctor?.name}{' '}
                    {s.doctor?.specialty ? <Chip size="small" label={s.doctor.specialty} sx={{ ml: 1 }} /> : null}
                  </TableCell>
                  <TableCell>{dayjs(s.startTime).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{dayjs(s.endTime).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{s.totalSeats}</TableCell>
 </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </>
  );
}
