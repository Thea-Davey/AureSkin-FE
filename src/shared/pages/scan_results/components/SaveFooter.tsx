import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, Save } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export interface SaveFooterProps {
  onDiscard: () => void;
  onSave: () => void;
  visible?: boolean;
  isSaving?: boolean;
  isDiscarding?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * SaveFooter (Shared Scan Results Component).
 * Collapsible sticky bottom prompt allowing users to either discard or save their
 * newly completed skin analysis results.
 * - Slides smoothly off-screen on downward reading scroll (native-driver translateY)
 * - Reappears on fast upward flick or upon reaching the top/bottom of the report
 * - Left button: Outlined red "Discard" (shorter width)
 * - Right button: Solid primary olive "Save" with save icon (longer width)
 */
export const SaveFooter: React.FC<SaveFooterProps> = ({
  onDiscard,
  onSave,
  visible = true,
  isSaving = false,
  isDiscarding = false,
  title = 'Save your analysis?',
  subtitle = 'Save your results to view them later, or discard them without saving.',
}) => {
  const insets = useSafeAreaInsets();
  const isBusy = isSaving || isDiscarding;

  const [measuredHeight, setMeasuredHeight] = useState<number>(148);
  const translateY = useRef(new Animated.Value(visible ? 0 : 180)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : measuredHeight + 24,
      duration: visible ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [visible, measuredHeight, translateY]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    if (nextHeight > 0 && nextHeight !== measuredHeight) {
      setMeasuredHeight(nextHeight);
    }
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateY }],
        paddingBottom: Math.max(insets.bottom, 16),
      }}
      className="bg-card border-t border-border px-4 pt-3 shadow-lg"
    >
      {/* Header Row: Info Icon + Title */}
      <View className="flex-row items-center gap-2">
        <AlertCircle size={18} color={theme.colors.text} strokeWidth={1.9} />
        <Text className="text-body font-sans-semibold text-text">
          {title}
        </Text>
      </View>

      {/* Subtitle */}
      <Text className="mt-1 text-caption font-sans text-muted">
        {subtitle}
      </Text>

      {/* Action Buttons Row: Shorter Discard (Left) + Longer Save (Right) */}
      <View className="mt-3 flex-row items-center gap-3 pb-6">
        {/* Discard Button */}
        <Pressable
          onPress={onDiscard}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Discard analysis results"
          style={{ flex: 1 }}
          className={`h-12 items-center justify-center rounded-button border border-status-error bg-card px-3 active:opacity-75 ${isBusy ? 'opacity-50' : ''
            }`}
        >
          {isDiscarding ? (
            <ActivityIndicator size="small" color={theme.colors.status.error} />
          ) : (
            <Text className="text-body font-sans-semibold text-status-error">
              Discard
            </Text>
          )}
        </Pressable>

        {/* Save Button (Longer) */}
        <Pressable
          onPress={onSave}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel="Save analysis results"
          style={{ flex: 1.9 }}
          className={`h-12 flex-row items-center justify-center gap-2 rounded-button bg-primary px-4 active:opacity-85 ${isBusy ? 'opacity-60' : ''
            }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Save size={18} color={theme.colors.white} strokeWidth={2.1} />
              <Text className="text-body font-sans-bold text-neutral-white">
                Save
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default SaveFooter;
