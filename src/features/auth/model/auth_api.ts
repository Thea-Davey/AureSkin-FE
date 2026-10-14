import { api } from '../../../shared/services/api';
import { LoginRequest, RegisterRequest, TokenResponse } from './auth_types';

export const authApi = {
  login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<TokenResponse>('/auth/register', data),
};
