import api from './axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
};
