import { AppBar, Box, Container, IconButton, Toolbar, Typography, Button, Stack } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();

  const LinkBtn = ({ to, label }: { to: string; label: string }) => (
    <Button
      color="inherit"
      component={RouterLink}
      to={to}
      variant={loc.pathname === to ? 'outlined' : 'text'}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  );

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 1 }}>
            <LocalHospitalIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Doctor Appointment Booking
          </Typography>
          <Stack direction="row" spacing={1}>
            <LinkBtn to="/slots" label="Browse Slots" />
            <LinkBtn to="/book" label="Book" />
            <LinkBtn to="/booking" label="My Booking" />
            <LinkBtn to="/admin/doctors" label="Admin: Doctors" />
            <LinkBtn to="/admin/slots" label="Admin: Slots" />
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}
