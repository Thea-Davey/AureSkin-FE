import { create } from 'zustand';
import {
  ScanResult,
  ShotType,
  SetupPhotos,
  QuestionnaireAnswer,
} from './scan_types';

/**
 * Normalizes a file path or URI to ensure it conforms to the strict triple-slash file scheme
 * required by React Native and Android Glide decoders (`file:///...`).
 * Preserves remote URLs (http/https) and Android Content URIs (content://).
 */
export function normalizeFileUri(uri?: string | null): string {
  if (!uri || typeof uri !== 'string') return '';
  const clean = uri.trim();
  if (
    clean.startsWith('content://') ||
    clean.startsWith('http://') ||
    clean.startsWith('https://')
  ) {
    return clean;
  }
  if (clean.startsWith('file:')) {
    return clean.replace(/^file:\/+/, 'file:///');
  }
  return `file://${clean.startsWith('/') ? '' : '/'}${clean}`;
}

export interface ScanStoreState {
  capturedImageUri: string | null;
  latestScanResult: ScanResult | null;
  hasNewScanForLibrary: boolean;
  hasNewScanForRoutine: boolean;

  // Setup & Questionnaire State
  enhancedSkinAnalysis: boolean;
  shotType: ShotType | null;
  photos: SetupPhotos;
  questionnaireAnswers: Record<number, QuestionnaireAnswer>;

  setCapturedImageUri: (uri: string | null) => void;
  setLatestScanResult: (result: ScanResult | null) => void;
  setHasNewScanForLibrary: (hasNew: boolean) => void;
  setHasNewScanForRoutine: (hasNew: boolean) => void;
  clearCapturedImage: () => void;
  clearScan: () => void;

  // Setup Actions
  setEnhancedSkinAnalysis: (enabled: boolean) => void;
  setShotType: (shotType: ShotType | null) => void;
  setPhoto: (side: 'front' | 'left' | 'right', uri: string | null) => void;
  setAllPhotos: (photos: SetupPhotos) => void;
  clearAllPhotos: () => void;
  setQuestionnaireAnswer: (questionId: number, answer: QuestionnaireAnswer) => void;
  setAllQuestionnaireAnswers: (answers: Record<number, QuestionnaireAnswer>) => void;
  clearQuestionnaireAnswers: () => void;
  resetScanSetup: () => void;
}

/**
 * Global In-Memory Scan Store
 *
 * Keeps the active facial scan photo URI, setup configurations, questionnaire answers,
 * and analyzed scan findings in memory across the scan lifecycle.
 */
export const useScanStore = create<ScanStoreState>((set) => ({
  capturedImageUri: null,
  latestScanResult: null,
  hasNewScanForLibrary: false,
  hasNewScanForRoutine: false,

  enhancedSkinAnalysis: true,
  shotType: null,
  photos: {},
  questionnaireAnswers: {},

  setCapturedImageUri: (uri) =>
    set({ capturedImageUri: uri ? normalizeFileUri(uri) : null }),
  setLatestScanResult: (result) =>
    set({
      latestScanResult: result,
      hasNewScanForLibrary: Boolean(result),
      hasNewScanForRoutine: Boolean(result),
    }),
  setHasNewScanForLibrary: (hasNew) => set({ hasNewScanForLibrary: hasNew }),
  setHasNewScanForRoutine: (hasNew) => set({ hasNewScanForRoutine: hasNew }),
  clearCapturedImage: () => set({ capturedImageUri: null }),
  clearScan: () =>
    set({
      capturedImageUri: null,
      latestScanResult: null,
      hasNewScanForLibrary: false,
      hasNewScanForRoutine: false,
    }),

  setEnhancedSkinAnalysis: (enabled) => set({ enhancedSkinAnalysis: enabled }),
  setShotType: (shotType) => set({ shotType }),
  setPhoto: (side, uri) =>
    set((state) => ({
      photos: {
        ...state.photos,
        [side]: uri ? normalizeFileUri(uri) : null,
      },
      // Keep capturedImageUri in sync with frontal photo
      ...(side === 'front' ? { capturedImageUri: uri ? normalizeFileUri(uri) : state.capturedImageUri } : {}),
    })),
  setAllPhotos: (photos) =>
    set((state) => ({
      photos,
      capturedImageUri: photos.front ? normalizeFileUri(photos.front) : state.capturedImageUri,
    })),
  clearAllPhotos: () => set({ photos: {}, capturedImageUri: null }),
  setQuestionnaireAnswer: (questionId, answer) =>
    set((state) => ({
      questionnaireAnswers: {
        ...state.questionnaireAnswers,
        [questionId]: answer,
      },
    })),
  setAllQuestionnaireAnswers: (answers) => set({ questionnaireAnswers: answers }),
  clearQuestionnaireAnswers: () => set({ questionnaireAnswers: {} }),
  resetScanSetup: () =>
    set({
      enhancedSkinAnalysis: true,
      shotType: null,
      photos: {},
      questionnaireAnswers: {},
      capturedImageUri: null,
    }),
}));


