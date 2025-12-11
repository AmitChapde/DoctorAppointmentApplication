 type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface Doctor {
  id: number;
  name: string;
  specialty?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  id: number;
  doctorId: number;
  startTime: string; // ISO
  endTime: string;   // ISO
  totalSeats: number;
  createdAt?: string;
  updatedAt?: string;
  // Returned in /users/slots
  doctor?: Doctor;
  availableSeats?: number;
}

export interface Appointment {
  id: string;
  slotId: number;
  userId: string;
  seats: number;
  status: BookingStatus;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
