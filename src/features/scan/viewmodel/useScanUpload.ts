import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery } from '@tanstack/react-query';
import { fetchGalleryPhotos } from '../model/scan_api';
import { GalleryPhotoItem } from '../model/scan_types';

export interface UseScanUploadReturn {
  // Data & Filtering
  photos: GalleryPhotoItem[];
  filteredPhotos: GalleryPhotoItem[];
  searchQuery: string;
  isLoading: boolean;
  isPicking: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  selectPhoto: (photoUri: string) => void;
  pickFromSystemGallery: () => Promise<void>;
  handleBack: () => void;
}

/**
 * ViewModel hook for the Scan Upload screen (Section 4.3).
 * Manages gallery photos query, real-time search filtering,
 * device media picker trigger (expo-image-picker), and navigation transitions.
 */
export function useScanUpload(): UseScanUploadReturn {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPicking, setIsPicking] = useState<boolean>(false);

  // 1. Fetch gallery photos query
  const { data: photos = [], isLoading } = useQuery<GalleryPhotoItem[]>({
    queryKey: ['scan', 'galleryPhotos'],
    queryFn: () => fetchGalleryPhotos(),
  });

  // 2. Real-time search filtering
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) {
      return photos;
    }
    const lower = searchQuery.toLowerCase().trim();
    return photos.filter(
      (photo) =>
        photo.filename?.toLowerCase().includes(lower) ||
        photo.tag?.toLowerCase().includes(lower)
    );
  }, [photos, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 3. User selects a photo tile from the grid
  const selectPhoto = useCallback(
    (photoUri: string) => {
      try {
        router.push({
          pathname: '/scan/submit' as any,
          params: { imageUri: photoUri },
        });
      } catch (err) {
        console.warn('Navigation to /scan/submit failed:', err);
      }
    },
    [router]
  );

  // 4. Launch native device picker to browse any system image
  const pickFromSystemGallery = useCallback(async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        router.push({
          pathname: '/scan/submit' as any,
          params: { imageUri: pickedUri },
        });
      }
    } catch (err) {
      console.warn('System photo picker error:', err);
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, router]);

  // 5. Back navigation: return to Scan Camera or fallback
  const handleBack = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/scan/camera' as any);
      }
    } catch {
      router.replace('/scan/camera' as any);
    }
  }, [router]);

  return {
    photos,
    filteredPhotos,
    searchQuery,
    isLoading,
    isPicking,
    setSearchQuery,
    clearSearch,
    selectPhoto,
    pickFromSystemGallery,
    handleBack,
  };
}

