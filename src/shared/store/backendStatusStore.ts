import { create } from 'zustand';

interface BackendStatusState {
  isBackendDown: boolean;
  title: string;
  subtitle: string;
  body: string;
  iconVariant: 'triangle' | 'robot';
  show: (customMessage?: string, customTitle?: string) => void;
  hide: () => void;
}

export const useBackendStatusStore = create<BackendStatusState>((set) => ({
  isBackendDown: false,
  title: 'Backend Server is currently down',
  subtitle: 'Developer is working on fixing it',
  body: 'While the problem is currently being fixed, you can browse our library and history at the moment.',
  iconVariant: 'triangle',
  show: (customMessage?: string, customTitle?: string) =>
    set({
      isBackendDown: true,
      ...(customTitle ? { title: customTitle } : {}),
      ...(customMessage ? { body: customMessage } : {}),
    }),
  hide: () =>
    set({
      isBackendDown: false,
    }),
}));

export const showBackendDownDialog = (customMessage?: string, customTitle?: string) => {
  useBackendStatusStore.getState().show(customMessage, customTitle);
};

export const hideBackendDownDialog = () => {
  useBackendStatusStore.getState().hide();
};

