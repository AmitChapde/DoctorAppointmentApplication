import api from './client';
import { Appointment, Doctor, Slot } from './types';

// Helper types for enriched payloads
export type AdminSlot = Slot & { doctor: Doctor };
export type SearchSlot = Slot & { doctor: Doctor; availableSeats: number };

export const SystemAPI = {
  health: () => api.get<{ ok: boolean; ts: string }>('/system/health').then(r => r.data),
  version: () => api.get<{ name: string; version: string }>('/system/version').then(r => r.data),
};

export const AdminAPI = {
  listDoctors: (): Promise<Doctor[]> =>
    api.get<Doctor[]>('/admin/doctors').then(r => r.data),

  createDoctor: (data: { name: string; specialty?: string | null }): Promise<Doctor> =>
    api.post<Doctor>('/admin/doctors', data).then(r => r.data),

  listSlots: (): Promise<AdminSlot[]> =>
    api.get<AdminSlot[]>('/admin/slots').then(r => r.data),

  createSlot: (
    doctorId: number,
    data: { startTime: string; endTime: string; totalSeats: number }
  ): Promise<Slot> =>
    api.post<Slot>(`/admin/doctors/${doctorId}/slots`, data).then(r => r.data),
};

export const UserAPI = {
  listDoctors: (): Promise<Doctor[]> =>
    api.get<Doctor[]>('/users/doctors').then(r => r.data),

  searchSlots: (params: { doctorId?: number; from?: string; to?: string }): Promise<SearchSlot[]> =>
    api.get<SearchSlot[]>('/users/slots', { params }).then(r => r.data),
};

export const BookingAPI = {
  createBooking: (data: { slotId: number; userId: string; seats: number; hold?: boolean }): Promise<Appointment> =>
    api.post<Appointment>('/bookings', data).then(r => r.data),

  confirmBooking: (id: string): Promise<Appointment> =>
    api.post<Appointment>(`/bookings/${id}/confirm`).then(r => r.data),

  cancelPending: (id: string): Promise<Appointment> =>
    api.post<Appointment>(`/bookings/${id}/cancel`).then(r => r.data),

  getBooking: (id: string): Promise<Appointment> =>
    api.get<Appointment>(`/bookings/${id}`).then(r => r.data),
};
