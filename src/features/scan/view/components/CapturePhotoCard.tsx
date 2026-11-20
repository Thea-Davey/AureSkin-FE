import React, { useState } from 'react';
import { View, Text, Pressable, Image, Modal, ImageSourcePropType } from 'react-native';
import { RotateCw, Eye, X } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { ShotType, SetupPhotos } from '../../model/scan_types';

const FRONT_FACE_SCAN: ImageSourcePropType = require('../../../../../assets/images/front-face-scan.png');
const LEFT_FACE_SCAN: ImageSourcePropType = require('../../../../../assets/images/left-face-scan.png');
const RIGHT_FACE_SCAN: ImageSourcePropType = require('../../../../../assets/images/right-face-scan.png');

export interface CapturePhotoCardProps {
  shotType: ShotType | null;
  photos: SetupPhotos;
  uploadedCount: number;
  requiredCount: number;
  hasUploadedPhotos: boolean;
  onUpload: () => void;
  onTakePhoto: () => void;
  onRetakePhoto: (side: 'left' | 'front' | 'right') => void;
  onRetakeAll?: () => void;
  onClearAll: () => void;
}

/**
 * CapturePhotoCard Component (Section 4.0 / Set Up Your Skin Analysis)
 * Row 1: Label + Shot Type (with dynamic "✕ Clear all" pill on upload)
 * Row 2: Dynamic 1-col (Single) or 3-col (Triple) slot preview with retake badges
 * Row 3: Dynamic uploaded count note (e.g. "1 of 1 uploaded" / "3 of 3 uploaded")
 * Row 4: Action buttons (Upload + Take Photos vs. Retake All Photo)
 */
export const CapturePhotoCard: React.FC<CapturePhotoCardProps> = ({
  shotType,
  photos,
  uploadedCount,
  requiredCount,
  hasUploadedPhotos,
  onUpload,
  onTakePhoto,
  onRetakePhoto,
  onRetakeAll,
  onClearAll,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<{ uri: string; label: string } | null>(null);

  const isTriple = shotType === 'triple';
  const shotLabel = isTriple ? 'Triple Shot' : 'Single Shot';

  const safePhotos = photos || {};
  const hasLeft = typeof safePhotos.left === 'string' && safePhotos.left.trim().length > 0;
  const hasFront = typeof safePhotos.front === 'string' && safePhotos.front.trim().length > 0;
  const hasRight = typeof safePhotos.right === 'string' && safePhotos.right.trim().length > 0;

  return (
    <Card className="p-4 bg-card mb-3">
      {/* Row 1: Label + Shot Type (with dynamic Clear all pill) */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-caption font-sans-medium text-muted">
          Capture Photo {shotType ? `• ${shotLabel}` : ''}
        </Text>

        {hasUploadedPhotos && (
          <Pressable
            onPress={onClearAll}
            accessibilityRole="button"
            accessibilityLabel="Clear all photos"
            className="rounded-badge border border-status-error/40 px-2.5 py-0.5 bg-status-error/5 active:opacity-75"
          >
            <Text className="text-caption font-sans-medium text-status-error">
              ✕ Clear all
            </Text>
          </Pressable>
        )}
      </View>

      {/* Row 2: Dynamic Inner Container */}
      {!shotType ? (
        <View className="h-40 rounded-card bg-neutral-offwhite items-center justify-center border border-border p-4">
          <Text className="text-body-sm font-sans text-muted text-center">
            Please choose a Shot Type above to proceed with photo capture.
          </Text>
        </View>
      ) : isTriple ? (
        /* Triple Shot: 3 Columns (Strictly Equal Widths) */
        <View className="flex-row items-center gap-2 w-full">
          {/* Left Column */}
          <View
            style={{ flex: 1, minWidth: 0 }}
            className="flex-1 min-w-0 h-36 rounded-card bg-neutral-offwhite border border-border overflow-hidden items-center justify-center relative"
          >
            {hasLeft ? (
              <>
                <Image
                  source={{ uri: safePhotos.left! }}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* View button on top left */}
                <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => setSelectedPreview({ uri: safePhotos.left!, label: 'Left Profile' })}
                    accessibilityRole="button"
                    accessibilityLabel="View left photo full size"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <Eye size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
                {/* Retake button on bottom right */}
                <View style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => onRetakePhoto('left')}
                    accessibilityLabel="Retake left photo"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <RotateCw size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                onPress={() => onRetakePhoto('left')}
                accessibilityRole="button"
                accessibilityLabel="Take left profile photo"
                className="items-center justify-center w-full h-full p-2 active:opacity-70"
              >
                <Image
                  source={LEFT_FACE_SCAN}
                  style={{ width: 62, height: 62 }}
                  resizeMode="contain"
                  accessibilityLabel="Left face scan guide"
                />
                <Text className="mt-1 text-caption font-sans-medium text-text">
                  Left
                </Text>
              </Pressable>
            )}
          </View>

          {/* Front Column */}
          <View
            style={{ flex: 1, minWidth: 0 }}
            className="flex-1 min-w-0 h-36 rounded-card bg-neutral-offwhite border border-border overflow-hidden items-center justify-center relative"
          >
            {hasFront ? (
              <>
                <Image
                  source={{ uri: safePhotos.front! }}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* View button on top left */}
                <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => setSelectedPreview({ uri: safePhotos.front!, label: 'Frontal Profile' })}
                    accessibilityRole="button"
                    accessibilityLabel="View front photo full size"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <Eye size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
                {/* Retake button on bottom right */}
                <View style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => onRetakePhoto('front')}
                    accessibilityRole="button"
                    accessibilityLabel="Retake front photo"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <RotateCw size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                onPress={() => onRetakePhoto('front')}
                accessibilityRole="button"
                accessibilityLabel="Take frontal photo"
                className="items-center justify-center w-full h-full p-2 active:opacity-70"
              >
                <Image
                  source={FRONT_FACE_SCAN}
                  style={{ width: 62, height: 62 }}
                  resizeMode="contain"
                  accessibilityLabel="Front face scan guide"
                />
                <Text className="mt-1 text-caption font-sans-medium text-text">
                  Front
                </Text>
              </Pressable>
            )}
          </View>

          {/* Right Column */}
          <View
            style={{ flex: 1, minWidth: 0 }}
            className="flex-1 min-w-0 h-36 rounded-card bg-neutral-offwhite border border-border overflow-hidden items-center justify-center relative"
          >
            {hasRight ? (
              <>
                <Image
                  source={{ uri: safePhotos.right! }}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {/* View button on top left */}
                <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => setSelectedPreview({ uri: safePhotos.right!, label: 'Right Profile' })}
                    accessibilityRole="button"
                    accessibilityLabel="View right photo full size"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <Eye size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
                {/* Retake button on bottom right */}
                <View style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}>
                  <Pressable
                    onPress={() => onRetakePhoto('right')}
                    accessibilityRole="button"
                    accessibilityLabel="Retake right photo"
                    className="w-7 h-7 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                  >
                    <RotateCw size={14} color={theme.colors.card} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable
                onPress={() => onRetakePhoto('right')}
                accessibilityRole="button"
                accessibilityLabel="Take right profile photo"
                className="items-center justify-center w-full h-full p-2 active:opacity-70"
              >
                <Image
                  source={RIGHT_FACE_SCAN}
                  style={{ width: 62, height: 62 }}
                  resizeMode="contain"
                  accessibilityLabel="Right face scan guide"
                />
                <Text className="mt-1 text-caption font-sans-medium text-text">
                  Right
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        /* Single Shot: 1 Column */
        <View className="h-44 rounded-card bg-neutral-offwhite border border-border overflow-hidden items-center justify-center relative">
          {hasFront ? (
            <>
              <Image
                source={{ uri: safePhotos.front! }}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {/* View button on top left */}
              <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <Pressable
                  onPress={() => setSelectedPreview({ uri: safePhotos.front!, label: 'Frontal Selfie' })}
                  accessibilityRole="button"
                  accessibilityLabel="View frontal selfie full size"
                  className="w-8 h-8 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                >
                  <Eye size={16} color={theme.colors.card} strokeWidth={2.2} />
                </Pressable>
              </View>
              {/* Retake button on bottom right */}
              <View style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}>
                <Pressable
                  onPress={() => onRetakePhoto('front')}
                  accessibilityRole="button"
                  accessibilityLabel="Retake frontal selfie"
                  className="w-8 h-8 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                >
                  <RotateCw size={16} color={theme.colors.card} strokeWidth={2.2} />
                </Pressable>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => onRetakePhoto('front')}
              accessibilityRole="button"
              accessibilityLabel="Take frontal selfie"
              className="items-center justify-center w-full h-full p-3 active:opacity-70"
            >
              <Image
                source={FRONT_FACE_SCAN}
                style={{ width: 88, height: 88 }}
                resizeMode="contain"
                accessibilityLabel="Frontal selfie scan guide"
              />
              <Text className="mt-2 text-caption font-sans-medium text-text">
                Frontal Selfie
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Row 3: Hidden dynamic complete state note */}
      {hasUploadedPhotos && (
        <View className="mt-2">
          <Text className="text-caption font-sans text-muted">
            {uploadedCount} of {requiredCount} uploaded
          </Text>
        </View>
      )}

      {/* Row 4: Action Buttons */}
      <View className="mt-3">
        {hasUploadedPhotos ? (
          <Button
            variant="outline"
            size="md"
            shape="rounded"
            fullWidth
            title={isTriple ? 'RETAKE ALL THREE (3) PHOTO' : 'RETAKE PHOTO'}
            onPress={onRetakeAll || onTakePhoto}
            textClassName="text-muted font-sans-bold text-caption"
            accessibilityLabel="Retake photos with camera"
          />
        ) : (
          <View className="flex-row items-center gap-3">
            <Button
              variant="outline"
              size="md"
              shape="rounded"
              title="UPLOAD PHOTOS"
              onPress={onUpload}
              disabled={!shotType}
              className={`flex-1 ${!shotType ? 'opacity-40' : ''}`}
              textClassName="text-text font-sans-bold text-caption"
              accessibilityLabel="Upload photos from device"
            />
            <Button
              variant="secondary"
              size="md"
              shape="rounded"
              title="TAKE PHOTOS"
              onPress={onTakePhoto}
              disabled={!shotType}
              className={`flex-1 ${!shotType ? 'opacity-40' : ''}`}
              textClassName="text-neutral-white font-sans-bold text-caption"
              accessibilityLabel="Take photos with camera"
            />
          </View>
        )}
      </View>

      {/* Full Photo Preview Modal Overlay */}
      <Modal
        visible={Boolean(selectedPreview)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPreview(null)}
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/95 items-center justify-center relative px-4">
          {/* Top Bar with Title and Close Button */}
          <View className="w-full flex-row items-center justify-between absolute top-14 left-0 right-0 px-6 z-20">
            <Text className="text-body font-sans-bold text-neutral-white">
              {selectedPreview?.label || 'Photo Preview'}
            </Text>
            <Pressable
              onPress={() => setSelectedPreview(null)}
              accessibilityRole="button"
              accessibilityLabel="Close photo preview"
              className="w-9 h-9 rounded-full bg-neutral-white/20 items-center justify-center active:opacity-70"
            >
              <X size={20} color={theme.colors.card} />
            </Pressable>
          </View>

          {/* Centered Full Photo */}
          {selectedPreview?.uri ? (
            <Image
              source={{ uri: selectedPreview.uri }}
              className="w-full h-[75%] rounded-card"
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </Card>
  );
};

export default CapturePhotoCard;

