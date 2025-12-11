import { useState } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';

export default function DoctorForm({ onCreate }: { onCreate: (name: string, specialty?: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim(), specialty.trim() || undefined);
      setName('');
      setSpecialty('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? 'Saving…' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
