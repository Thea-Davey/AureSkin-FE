import { api } from '../../../shared/services/api';
import { LoginRequest, RegisterRequest, AuthResponse } from './auth_types';

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
};
