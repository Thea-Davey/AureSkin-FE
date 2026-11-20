import { create } from 'zustand';
import { DevSettings, Platform } from 'react-native';
import { router } from 'expo-router';

interface BackendUpdateState {
  isUpdateAvailable: boolean;
  serverVersion: string | null;
  lastKnownVersion: string | null;
  title: string;
  subtitle: string;
  body: string;
  show: (customMessage?: string, customTitle?: string) => void;
  hide: () => void;
  checkVersion: (newVersion?: string | null) => void;
  reloadApp: () => void;
}

export const useBackendUpdateStore = create<BackendUpdateState>((set, get) => ({
  isUpdateAvailable: false,
  serverVersion: null,
  lastKnownVersion: null,
  title: 'Backend Update Detected',
  subtitle: 'A new update is available on the backend. An app reload is required to apply the latest changes.',
  body: 'Would you like to reload the app now?',
  show: (customMessage?: string, customTitle?: string) =>
    set({
      isUpdateAvailable: true,
      ...(customTitle ? { title: customTitle } : {}),
      ...(customMessage ? { body: customMessage } : {}),
    }),
  hide: () =>
    set({
      isUpdateAvailable: false,
    }),
  checkVersion: (newVersion?: string | null) => {
    if (!newVersion || typeof newVersion !== 'string') return;
    const cleanVersion = newVersion.trim();
    const current = get().lastKnownVersion;

    if (!current) {
      // First version observed during app session: establish baseline
      set({ lastKnownVersion: cleanVersion, serverVersion: cleanVersion });
      return;
    }

    if (current !== cleanVersion) {
      console.log(`[BackendUpdate] New backend version detected: ${cleanVersion} (was ${current})`);
      set({
        isUpdateAvailable: true,
        serverVersion: cleanVersion,
      });
    }
  },
  reloadApp: () => {
    set({ isUpdateAvailable: false });
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.location.reload();
      } else if (__DEV__ && DevSettings?.reload) {
        DevSettings.reload();
      } else {
        router.replace('/' as any);
      }
    } catch {
      router.replace('/' as any);
    }
  },
}));

export const showBackendUpdateDialog = (customMessage?: string, customTitle?: string) => {
  useBackendUpdateStore.getState().show(customMessage, customTitle);
};

export const hideBackendUpdateDialog = () => {
  useBackendUpdateStore.getState().hide();
};

export const reloadApplication = () => {
  useBackendUpdateStore.getState().reloadApp();
};
