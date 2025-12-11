import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DoctorsPage from './pages/admin/DoctorsPage';
import SlotsPage from './pages/admin/SlotsPage';
import SlotSearchPage from './pages/user/SlotSearchPage';
import BookingPage from './pages/user/BookingPage';
import BookingStatusPage from './pages/user/BookingStatusPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
 <Route path="/" element={<Navigate to="/slots" replace />} />
        <Route path="/slots" element={<SlotSearchPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/booking" element={<BookingStatusPage />} />

        {/* Admin */}
        <Route path="/admin/doctors" element={<DoctorsPage />} />
        <Route path="/admin/slots" element={<SlotsPage />} />

        <Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
      </Routes>
    </AppLayout>
  );
}
