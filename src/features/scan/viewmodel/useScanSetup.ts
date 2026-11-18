import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useScanStore } from '../model/scanStore';
import { ShotType, SetupPhotos } from '../model/scan_types';
import { MOCK_SETUP_PHOTOS } from '../model/scan_mock';

export function useScanSetup() {
  const router = useRouter();

  const enhancedSkinAnalysis = useScanStore((s) => s.enhancedSkinAnalysis);
  const shotType = useScanStore((s) => s.shotType);
  const photos = useScanStore((s) => s.photos);
  const questionnaireAnswers = useScanStore((s) => s.questionnaireAnswers);

  const setEnhancedSkinAnalysis = useScanStore((s) => s.setEnhancedSkinAnalysis);
  const setShotType = useScanStore((s) => s.setShotType);
  const setPhoto = useScanStore((s) => s.setPhoto);
  const setAllPhotos = useScanStore((s) => s.setAllPhotos);
  const clearAllPhotos = useScanStore((s) => s.clearAllPhotos);
  const clearQuestionnaireAnswers = useScanStore((s) => s.clearQuestionnaireAnswers);
  const setCapturedImageUri = useScanStore((s) => s.setCapturedImageUri);
  const resetScanSetup = useScanStore((s) => s.resetScanSetup);

  // ── Exit Dialog State ──────────────────────────────────────────
  const [isExitDialogOpen, setIsExitDialogOpen] = useState<boolean>(false);

  const openExitDialog = useCallback(() => {
    setIsExitDialogOpen(true);
  }, []);

  const closeExitDialog = useCallback(() => {
    setIsExitDialogOpen(false);
  }, []);

  const handleSaveAsDraft = useCallback(() => {
    setIsExitDialogOpen(false);
    router.replace('/(tabs)');
  }, [router]);

  const handleDiscard = useCallback(() => {
    setIsExitDialogOpen(false);
    resetScanSetup();
    router.replace('/(tabs)');
  }, [resetScanSetup, router]);

  // ── Derived State ─────────────────────────────────────────────
  const isQuestionnaireCompleted = useMemo(() => {
    return Object.keys(questionnaireAnswers).length === 10;
  }, [questionnaireAnswers]);

  const requiredPhotosCount = useMemo(() => {
    if (shotType === 'single') return 1;
    if (shotType === 'triple') return 3;
    return 0;
  }, [shotType]);

  const uploadedCount = useMemo(() => {
    if (shotType === 'single') {
      return photos.front ? 1 : 0;
    }
    if (shotType === 'triple') {
      let count = 0;
      if (photos.left) count += 1;
      if (photos.front) count += 1;
      if (photos.right) count += 1;
      return count;
    }
    return 0;
  }, [shotType, photos]);

  const isPhotosComplete = useMemo(() => {
    if (shotType === null) return false;
    return uploadedCount === requiredPhotosCount && requiredPhotosCount > 0;
  }, [shotType, uploadedCount, requiredPhotosCount]);

  const hasUploadedPhotos = useMemo(() => {
    return uploadedCount > 0;
  }, [uploadedCount]);

  const canSubmit = useMemo(() => {
    if (shotType === null) return false;
    if (!isPhotosComplete) return false;
    if (enhancedSkinAnalysis && !isQuestionnaireCompleted) return false;
    return true;
  }, [shotType, isPhotosComplete, enhancedSkinAnalysis, isQuestionnaireCompleted]);

  const footerStatus = useMemo(() => {
    if (canSubmit) {
      const shotPrefix =
        shotType === 'single'
          ? 'Single Shot • 1 of 1 uploaded'
          : 'Triple Shot • 3 of 3 uploaded';
      const qSuffix = enhancedSkinAnalysis ? ' • Questionnaire Completed' : '';
      return {
        isReady: true,
        header: 'Ready for analysis',
        subtitle: `${shotPrefix}${qSuffix}`,
      };
    }
    return {
      isReady: false,
      header: 'Review before submitting',
      subtitle: 'Selected analysis • Photos • Questionnaire status',
    };
  }, [canSubmit, shotType, enhancedSkinAnalysis]);

  // ── Callbacks ──────────────────────────────────────────────────
  const toggleEnhancedAnalysis = useCallback(() => {
    setEnhancedSkinAnalysis(!enhancedSkinAnalysis);
  }, [enhancedSkinAnalysis, setEnhancedSkinAnalysis]);

  const selectShotType = useCallback(
    (type: ShotType | null) => {
      setShotType(type);
    },
    [setShotType]
  );

  const handleUploadPhotos = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: shotType === 'triple',
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          if (shotType === 'single') {
            setPhoto('front', result.assets[0].uri);
            setCapturedImageUri(result.assets[0].uri);
          } else {
            const newPhotos: SetupPhotos = {
              left: result.assets[0]?.uri || MOCK_SETUP_PHOTOS.left,
              front: result.assets[1]?.uri || result.assets[0]?.uri || MOCK_SETUP_PHOTOS.front,
              right: result.assets[2]?.uri || result.assets[0]?.uri || MOCK_SETUP_PHOTOS.right,
            };
            setAllPhotos(newPhotos);
          }
          return;
        }
      }
    } catch {
      // Fallback to mock images on permission refusal or failure
    }

    // Default mock population for seamless testing
    if (shotType === 'single') {
      setPhoto('front', MOCK_SETUP_PHOTOS.front || null);
    } else {
      setAllPhotos(MOCK_SETUP_PHOTOS);
    }
  }, [shotType, setPhoto, setAllPhotos, setCapturedImageUri]);

  const handleTakePhotos = useCallback(() => {
    if (!shotType) return;
    if (shotType === 'single') {
      router.push({
        pathname: '/scan/camera' as any,
        params: { returnTo: 'setup', mode: 'single', targetSide: 'front' },
      });
    } else {
      router.push({
        pathname: '/scan/camera' as any,
        params: { returnTo: 'setup', mode: 'consecutive', targetSide: 'front' },
      });
    }
  }, [shotType, router]);

  const handleRetakePhoto = useCallback(
    (side: 'front' | 'left' | 'right') => {
      router.push({
        pathname: '/scan/camera' as any,
        params: { returnTo: 'setup', mode: 'single', targetSide: side },
      });
    },
    [router]
  );

  const handleRetakeAll = useCallback(() => {
    if (!shotType) return;
    clearAllPhotos();
    if (shotType === 'single') {
      router.push({
        pathname: '/scan/camera' as any,
        params: { returnTo: 'setup', mode: 'single', targetSide: 'front' },
      });
    } else {
      router.push({
        pathname: '/scan/camera' as any,
        params: { returnTo: 'setup', mode: 'consecutive', targetSide: 'front' },
      });
    }
  }, [shotType, clearAllPhotos, router]);

  const handleClearAllPhotos = useCallback(() => {
    clearAllPhotos();
  }, [clearAllPhotos]);

  const handleAnswerQuestionnaire = useCallback(() => {
    router.push('/scan/questionnaire');
  }, [router]);

  const handleReviewAnswers = useCallback(() => {
    router.push('/scan/review-answers');
  }, [router]);

  const handleRetakeQuestionnaire = useCallback(() => {
    clearQuestionnaireAnswers();
    router.push('/scan/questionnaire');
  }, [clearQuestionnaireAnswers, router]);

  const handleCancel = useCallback(() => {
    openExitDialog();
  }, [openExitDialog]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    if (photos.front) {
      setCapturedImageUri(photos.front);
    }
    router.push('/scan/analyzing');
  }, [canSubmit, photos, setCapturedImageUri, router]);

  return {
    enhancedSkinAnalysis,
    shotType,
    photos,
    questionnaireAnswers,
    isQuestionnaireCompleted,
    requiredPhotosCount,
    uploadedCount,
    isPhotosComplete,
    hasUploadedPhotos,
    canSubmit,
    footerStatus,
    toggleEnhancedAnalysis,
    selectShotType,
    handleUploadPhotos,
    handleTakePhotos,
    handleRetakePhoto,
    handleRetakeAll,
    handleClearAllPhotos,
    handleAnswerQuestionnaire,
    handleReviewAnswers,
    handleRetakeQuestionnaire,
    handleCancel,
    handleSubmit,
    isExitDialogOpen,
    openExitDialog,
    closeExitDialog,
    handleSaveAsDraft,
    handleDiscard,
  };
}

