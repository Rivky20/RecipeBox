import api from './axios';
import { AppUser, SystemStats } from '../types';

export const userService = {
  getUsers: () =>
    api.get<AppUser[]>('/api/users').then((r) => r.data),

  getUser: (id: string) =>
    api.get<AppUser>(`/api/users/${id}`).then((r) => r.data),

  blockUser: (id: string) =>
    api.patch(`/api/users/${id}/block`),

  unblockUser: (id: string) =>
    api.patch(`/api/users/${id}/unblock`),

  getStats: () =>
    api.get<SystemStats>('/api/users/stats').then((r) => r.data),
};
