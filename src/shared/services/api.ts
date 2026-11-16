import axios from 'axios';
import { supabase } from './supabase';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL,
  timeout: 15000, // 15s standard baseline timeout for mobile networks (overridden per-request for heavy uploads like /scan or /routine/generate)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the Supabase JWT token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unified error format
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface standardized error message if it exists
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message;
    }
    return Promise.reject(error);
  }
);
