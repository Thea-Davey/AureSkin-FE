import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from './supabase';

/**
 * Dynamically resolves the backend API base URL.
 * - Honors HTTPS production URLs from EXPO_PUBLIC_API_BASE_URL.
 * - In local Expo Go / LAN dev, derives the laptop's live LAN IP from Metro's hostUri
 *   (e.g., "192.168.1.23:8081" -> "http://192.168.1.23:8000") so switching Wi-Fi networks
 *   never gets stuck on a stale cached `.env` IP.
 */
function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (envUrl && envUrl.startsWith('https://')) {
    return envUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    // Fallback fields for older Expo manifest shapes
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    const isLanIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    if (isLanIp && host !== '127.0.0.1') {
      return `http://${host}:8000`;
    }
  }

  return envUrl || 'http://localhost:8000';
}

const baseURL = resolveApiBaseUrl();
console.log('[API] Resolved baseURL:', baseURL);

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
