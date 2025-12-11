import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, CardHeader, Divider, Snackbar, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { AdminAPI } from '../../api/endpoints';
import { Doctor } from '../../api/types';
import DoctorForm from '../../components/DoctorForm';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await AdminAPI.listDoctors();
     setDoctors(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (name: string, specialty?: string) => {
    try {
      await AdminAPI.createDoctor({ name, specialty: specialty ?? null });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Add Doctor" />
        <CardContent>
          <DoctorForm onCreate={onCreate} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Doctors" />
        <Divider />
        <CardContent sx={{ px: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Specialty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.specialty || '-'}</TableCell>
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
