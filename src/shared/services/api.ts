import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { showBackendDownDialog } from '../store/backendStatusStore';
import { useBackendUpdateStore } from '../store/backendUpdateStore';

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

let isProbingRailway = false;

/**
 * Actively verifies whether the backend container has truly crashed on Railway.
 * When Railway containers crash (e.g. OOM or unhandled exit), Railway's edge router
 * immediately responds with 502 Bad Gateway or 503 Service Unavailable across all routes.
 * A lightweight probe to /health confirms whether the server is down vs. an individual slow route.
 */
async function checkRailwayActuallyCrashed(): Promise<boolean> {
  if (isProbingRailway) return false;
  isProbingRailway = true;
  try {
    const probe = await axios.get(`${baseURL}/health`, {
      timeout: 4000,
      headers: { Accept: 'application/json' },
    });
    // If /health responded 200, the server is UP and running - do not show crash dialog
    if (probe.status === 200) {
      return false;
    }
    return false;
  } catch (err: any) {
    const probeStatus = err.response?.status;
    // Railway proxy returns 502 / 503 when the container is crashed
    if (probeStatus === 502 || probeStatus === 503) {
      return true;
    }
    return false;
  } finally {
    isProbingRailway = false;
  }
}

// Response interceptor to handle unified error format, backend updates, and verified server downtime
api.interceptors.response.use(
  (response) => {
    // Check if backend returned a version header to detect updates
    const backendVersion =
      response.headers?.['x-backend-version'] ||
      response.headers?.['x-app-version'] ||
      response.data?.meta?.version;
    if (backendVersion) {
      useBackendUpdateStore.getState().checkVersion(backendVersion);
    }
    return response;
  },
  async (error) => {
    const isCanceled =
      axios.isCancel(error) ||
      error.name === 'AbortError' ||
      error.code === 'ERR_CANCELED';

    const status = error.response?.status;
    const shouldSkip =
      Boolean((error.config as any)?.skipCrashDialog) || isCanceled;

    // Only suspect a crash if Railway returns 502 Bad Gateway or 503 Service Unavailable.
    // Do NOT trigger on client errors (4xx), normal timeouts, canceled requests, or 500 app errors.
    if (!shouldSkip && (status === 502 || status === 503)) {
      void checkRailwayActuallyCrashed().then((actuallyCrashed) => {
        if (actuallyCrashed) {
          console.warn('[API] Verified Railway backend crash (502/503), displaying notification');
          showBackendDownDialog();
        }
      });
    }

    // Surface standardized error message if it exists
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message;
    }
    return Promise.reject(error);
  }
);
