import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface UseAddProductUploadResult {
  isPicking: boolean;
  error: string | null;
  actions: {
    pickPhoto: () => Promise<void>;
    goBack: () => void;
  };
}

export function useAddProductUpload(): UseAddProductUploadResult {
  const router = useRouter();
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = useCallback(async () => {
    if (isPicking) {
      return;
    }

    setIsPicking(true);
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        router.dismissTo({
          pathname: '/library/add-product-camera',
          params: { selectedPhotoUri: result.assets[0].uri },
        });
      }
    } catch (pickerError) {
      setError(
        pickerError instanceof Error
          ? `Could not open photo picker: ${pickerError.message}`
          : 'Could not open photo picker.'
      );
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, router]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/library/add-product-camera');
  }, [router]);

  return {
    isPicking,
    error,
    actions: {
      pickPhoto,
      goBack,
    },
  };
}
