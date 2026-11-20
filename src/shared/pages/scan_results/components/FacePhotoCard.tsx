import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { UserRound, Eye, X } from 'lucide-react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/shared/theme';
import { ShotType } from '@/features/scan/model/scan_types';

export interface FacePhotoCardProps {
  imageUri?: string | null;
  fallbackUri?: string | null;
  shotType?: ShotType | string | null;
  imageUrls?:
    | { front?: string | null; left?: string | null; right?: string | null }
    | Record<string, string | null | undefined>
    | null;
}

interface PhotoColumnItemProps {
  label: string;
  uri?: string | null;
  onView: (uri: string, label: string) => void;
}

interface ZoomablePhotoModalProps {
  visible: boolean;
  uri?: string | null;
  label?: string | null;
  onClose: () => void;
}

const ZoomablePhotoModal: React.FC<ZoomablePhotoModalProps> = ({
  visible,
  uri,
  label,
  onClose,
}) => {
  const [useRNImage, setUseRNImage] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  useEffect(() => {
    if (visible) {
      setUseRNImage(false);
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [visible, uri]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.05) {
        resetZoom();
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetZoom();
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.2) {
        resetZoom();
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(panGesture, doubleTapGesture)
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const cleanUri = (uri || '').trim().replace(/\?$/, '');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' }}>
        {/* Top Bar with Title and Close Button (clean edge-to-edge paddingHorizontal 16) */}
        <View
          style={{
            position: 'absolute',
            top: 48,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 40,
          }}
        >
          <Text className="text-body font-sans-bold text-neutral-white">
            {label || 'Photo Preview'}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close photo preview"
            className="w-10 h-10 rounded-full bg-neutral-white/20 items-center justify-center active:opacity-70"
          >
            <X size={20} color={theme.colors.card} />
          </Pressable>
        </View>

        {/* Center Zoomable Image Container */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {cleanUri ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                style={[
                  {
                    width: '94%',
                    height: '75%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  animatedImageStyle,
                ]}
              >
                {!useRNImage ? (
                  <Image
                    key={`modal-expo-${cleanUri}`}
                    source={{ uri: cleanUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    contentFit="contain"
                    onError={() => setUseRNImage(true)}
                    accessibilityLabel="Full size analyzed face photo"
                  />
                ) : (
                  <RNImage
                    key={`modal-rn-${cleanUri}`}
                    source={{ uri: cleanUri }}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    resizeMode="contain"
                    accessibilityLabel="Full size analyzed face photo"
                  />
                )}
              </Animated.View>
            </GestureDetector>
          ) : (
            <View className="items-center justify-center">
              <UserRound size={56} color={theme.colors.muted} />
              <Text className="mt-2 text-body-sm font-sans text-neutral-white/70">
                Photo preview unavailable
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Helper Hint */}
        <View
          style={{
            position: 'absolute',
            bottom: 32,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 20,
          }}
          pointerEvents="none"
        >
          <View className="rounded-badge bg-black/60 px-3 py-1">
            <Text className="text-caption font-sans text-neutral-white/80">
              Pinch with 2 fingers to zoom • Double-tap to reset
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const PhotoColumnItem: React.FC<PhotoColumnItemProps> = ({ label, uri, onView }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const cleanUri = (uri || '').trim().replace(/\?$/, '');

  useEffect(() => {
    setHasError(false);
  }, [cleanUri]);

  return (
    <View
      style={{ flex: 1, minWidth: 0 }}
      className="flex-1 min-w-0 aspect-[3/4] rounded-card bg-neutral-offwhite border border-border overflow-hidden relative items-center justify-center"
    >
      {cleanUri && !hasError ? (
        <>
          <Image
            source={{ uri: cleanUri }}
            contentFit="cover"
            transition={200}
            style={{ width: '100%', height: '100%' }}
            onError={() => setHasError(true)}
            accessibilityLabel={`${label} profile photo`}
          />
          {/* View icon button on top left */}
          <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
            <Pressable
              onPress={() => onView(cleanUri, `${label} Profile`)}
              accessibilityRole="button"
              accessibilityLabel={`View ${label} profile photo full size`}
              className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
            >
              <Eye size={14} color={theme.colors.card} strokeWidth={2.2} />
            </Pressable>
          </View>
          {/* Label badge at bottom center */}
          <View
            style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}
            pointerEvents="none"
          >
            <View className="rounded-badge bg-black/60 px-2 py-0.5">
              <Text className="text-caption font-sans-medium text-neutral-white">
                {label}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View className="items-center justify-center p-2">
          <UserRound size={32} color={theme.colors.muted} />
          <Text className="mt-1 text-caption font-sans-medium text-muted">
            {label}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * FacePhotoCard (Section 4.6).
 * Prominent full-width rounded card displaying the captured face photo(s)
 * analyzed by the AI pipeline.
 * - Single Shot: 1 column square preview with top-left view icon button.
 * - Triple Shot: 3 columns (Left, Front, Right) with top-left view icon buttons.
 * - Includes modal for viewing full-size photo upon tapping the view button.
 */
export const FacePhotoCard: React.FC<FacePhotoCardProps> = ({
  imageUri,
  fallbackUri,
  shotType,
  imageUrls,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<{ uri: string; label: string } | null>(
    null
  );
  const [useFallbackUri, setUseFallbackUri] = useState<boolean>(false);
  const [useRNImage, setUseRNImage] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const cleanPrimary = (imageUri || '').trim().replace(/\?$/, '');
  const cleanFallback = (fallbackUri || '').trim().replace(/\?$/, '');

  const activeUri = useFallbackUri || !cleanPrimary ? cleanFallback : cleanPrimary;

  const isTriple =
    shotType === 'triple' ||
    Boolean(imageUrls && (imageUrls.left || imageUrls.right));

  const leftUri = imageUrls?.left || null;
  const frontUri = imageUrls?.front || activeUri || null;
  const rightUri = imageUrls?.right || null;

  useEffect(() => {
    setUseFallbackUri(false);
    setUseRNImage(false);
    setImageFailed(false);
  }, [cleanPrimary, cleanFallback]);

  const handleExpoError = (err: any) => {
    console.warn('[FacePhotoCard] expo-image error on:', activeUri, err);
    if (!useFallbackUri && cleanFallback && cleanFallback !== cleanPrimary) {
      setUseFallbackUri(true);
      return;
    }
    if (!useRNImage) {
      setUseRNImage(true);
      return;
    }
    setImageFailed(true);
  };

  const handleRNError = (err: any) => {
    console.warn('[FacePhotoCard] RNImage error on:', activeUri, err);
    if (!useFallbackUri && cleanFallback && cleanFallback !== cleanPrimary) {
      setUseFallbackUri(true);
      setUseRNImage(false);
      return;
    }
    setImageFailed(true);
  };

  return (
    <View className="mx-4 mt-4 rounded-card overflow-hidden border border-border bg-card shadow-xs">
      {isTriple ? (
        /* Triple Shot: 3 Columns (Left, Front, Right) */
        <View className="p-3 bg-card flex-row items-center gap-2 w-full">
          <PhotoColumnItem
            label="Left"
            uri={leftUri}
            onView={(uri, label) => setSelectedPreview({ uri, label })}
          />
          <PhotoColumnItem
            label="Front"
            uri={frontUri}
            onView={(uri, label) => setSelectedPreview({ uri, label })}
          />
          <PhotoColumnItem
            label="Right"
            uri={rightUri}
            onView={(uri, label) => setSelectedPreview({ uri, label })}
          />
        </View>
      ) : (
        /* Single Shot: 1 Column */
        <View className="aspect-square w-full items-center justify-center bg-background overflow-hidden relative">
          {activeUri && !imageFailed ? (
            <>
              {!useRNImage ? (
                <Image
                  key={`expo-${activeUri}`}
                  source={{ uri: activeUri }}
                  contentFit="cover"
                  transition={200}
                  style={{ width: '100%', height: '100%' }}
                  onError={handleExpoError}
                  accessibilityLabel="Analyzed face photo"
                />
              ) : (
                <RNImage
                  key={`rn-${activeUri}`}
                  source={{ uri: activeUri }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                  onError={handleRNError}
                  accessibilityLabel="Analyzed face photo"
                />
              )}
              {/* View button on top left for single shot */}
              <View style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                <Pressable
                  onPress={() => setSelectedPreview({ uri: activeUri, label: 'Analyzed Face Photo' })}
                  accessibilityRole="button"
                  accessibilityLabel="View photo full size"
                  className="w-8 h-8 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                >
                  <Eye size={16} color={theme.colors.card} strokeWidth={2.2} />
                </Pressable>
              </View>
            </>
          ) : (
            <View className="items-center justify-center py-10">
              <UserRound size={56} color={theme.colors.muted} />
              <Text className="mt-2 text-body-sm font-sans text-muted">
                Scan photo unavailable
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Full Photo Zoomable Preview Modal Overlay */}
      <ZoomablePhotoModal
        visible={Boolean(selectedPreview)}
        uri={selectedPreview?.uri}
        label={selectedPreview?.label}
        onClose={() => setSelectedPreview(null)}
      />
    </View>
  );
};

export default FacePhotoCard;
