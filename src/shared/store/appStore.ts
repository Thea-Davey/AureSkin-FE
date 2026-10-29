import { create } from 'zustand';

interface AppState {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;

  isScanOverlayOpen: boolean;
  openScanOverlay: () => void;
  closeScanOverlay: () => void;
  toggleScanOverlay: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  isScanOverlayOpen: false,
  openScanOverlay: () => set({ isScanOverlayOpen: true }),
  closeScanOverlay: () => set({ isScanOverlayOpen: false }),
  toggleScanOverlay: () => set((state) => ({ isScanOverlayOpen: !state.isScanOverlayOpen })),
}));
