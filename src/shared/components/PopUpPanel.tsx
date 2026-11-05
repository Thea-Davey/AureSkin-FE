import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PopUpPanelProps {
  /** Visibility of the pop-up panel */
  visible: boolean;
  /** Header title displayed on the top left */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Callback to close the panel */
  onClose: () => void;
  /**
   * Layout style:
   * 1 = Includes bottom action buttons ("Reset" and "Apply filters")
   * 2 = Content-only without bottom buttons
   * Default: 1
   */
  style?: 1 | 2;
  /** Content rendered inside the sliding panel */
  children: ReactNode;

  // Style 1 Action props
  /** Callback when "Reset" button is pressed (Style 1 only) */
  onReset?: () => void;
  /** Callback when "Apply filters" button is pressed (Style 1 only) */
  onApply?: () => void;
  /** Label for the Reset button. Default: "Reset" */
  resetLabel?: string;
  /** Label for the Apply button. Default: "Apply filters" */
  applyLabel?: string;
  /** Whether the apply button is disabled */
  isApplyDisabled?: boolean;

  /** Optional custom max-height class (e.g. 'max-h-[85%]', 'max-h-[90%]') */
  maxHeightClass?: string;

  /** Whether the panel should fully expand to max height regardless of content size. Default: false */
  fullHeight?: boolean;
}

export function PopUpPanel({
  visible,
  title,
  subtitle,
  onClose,
  style = 1,
  children,
  onReset,
  onApply,
  resetLabel = 'Reset',
  applyLabel = 'Apply filters',
  isApplyDisabled = false,
  maxHeightClass,
  fullHeight = false,
}: PopUpPanelProps) {
  const [isMounted, setIsMounted] = useState(visible);
  const sheetOffset = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Track animation state to avoid interrupting running animations
  const isClosingRef = useRef(false);
  const activeAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // Sync mount state when visible becomes true
  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
    }
  }, [visible, isMounted]);

  // Main animation driver
  useEffect(() => {
    if (!isMounted) return;

    if (visible) {
      // Opening animation
      isClosingRef.current = false;
      if (activeAnimRef.current) {
        activeAnimRef.current.stop();
      }

      sheetOffset.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      const openAnim = Animated.parallel([
        Animated.spring(sheetOffset, {
          toValue: 0,
          damping: 26,
          stiffness: 240,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      activeAnimRef.current = openAnim;
      openAnim.start(() => {
        activeAnimRef.current = null;
      });
    } else {
      // Closing animation when parent passes visible: false
      if (isClosingRef.current) {
        return;
      }

      isClosingRef.current = true;
      if (activeAnimRef.current) {
        activeAnimRef.current.stop();
      }

      const closeAnim = Animated.parallel([
        Animated.timing(sheetOffset, {
          toValue: SCREEN_HEIGHT,
          duration: 230,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      activeAnimRef.current = closeAnim;
      closeAnim.start(({ finished }) => {
        activeAnimRef.current = null;
        if (finished) {
          isClosingRef.current = false;
          setIsMounted(false);
        }
      });
    }
  }, [backdropOpacity, isMounted, sheetOffset, visible]);

  // Clean up any running animation on final unmount
  useEffect(() => {
    return () => {
      if (activeAnimRef.current) {
        activeAnimRef.current.stop();
      }
    };
  }, []);

  // Handle user-initiated close (backdrop press, 'X' button, hardware back)
  const handleUserClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (activeAnimRef.current) {
      activeAnimRef.current.stop();
    }

    const closeAnim = Animated.parallel([
      Animated.timing(sheetOffset, {
        toValue: SCREEN_HEIGHT,
        duration: 230,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    activeAnimRef.current = closeAnim;
    closeAnim.start(({ finished }) => {
      activeAnimRef.current = null;
      if (finished) {
        isClosingRef.current = false;
        setIsMounted(false);
      }
    });

    onClose();
  };

  if (!isMounted) return null;

  const maxPanelHeight = Math.round(SCREEN_HEIGHT * 0.88);
  const maxContentHeight = maxPanelHeight - (style === 1 ? 160 : 100);

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={handleUserClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Dim Overlay - Fades in/out independently on the native UI thread */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close panel backdrop"
            onPress={handleUserClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Sliding Bottom Panel - Native spring slide-up from bottom to 0 */}
        <Animated.View
          style={{
            height: fullHeight ? maxPanelHeight : undefined,
            maxHeight: maxPanelHeight,
            transform: [{ translateY: sheetOffset }],
          }}
          className={`w-full rounded-t-card bg-card px-5 pb-8 pt-5 shadow-2xl ${
            maxHeightClass ?? ''
          }`}
        >
          {/* Header Row: Title (+ Optional Subtitle) & "X" Close Button */}
          <View className="mb-4 flex-row items-center justify-between border-b border-border/40 pb-3">
            <View className="flex-1 pr-3">
              <Text className="text-h3 font-sans-bold text-text">
                {title}
              </Text>
              {subtitle ? (
                <Text className="mt-0.5 text-caption font-sans text-muted">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={handleUserClose}
              hitSlop={10}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-neutral-offwhite"
            >
              <X size={20} color={theme.colors.text} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Panel Content Body: Expands dynamically with children content, or fills panel when fullHeight */}
          <View
            className={fullHeight ? 'flex-1' : 'shrink-0'}
            style={fullHeight ? undefined : { maxHeight: maxContentHeight }}
          >
            {children}
          </View>

          {/* Style 1: Bottom Action Buttons ("Reset" and "Apply filters") */}
          {style === 1 ? (
            <View className="mt-4 flex-row gap-3 pt-2 border-t border-border/30">
              <Pressable
                onPress={onReset}
                accessibilityRole="button"
                accessibilityLabel={resetLabel}
                className="flex-1 items-center justify-center rounded-button border border-border py-3 active:opacity-75"
              >
                <Text className="text-label font-sans-semibold text-text">
                  {resetLabel}
                </Text>
              </Pressable>
              <Pressable
                disabled={isApplyDisabled}
                onPress={onApply}
                accessibilityRole="button"
                accessibilityLabel={applyLabel}
                className={`flex-1 items-center justify-center rounded-button bg-primary py-3 active:opacity-80 ${
                  isApplyDisabled ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-label font-sans-bold text-neutral-white">
                  {applyLabel}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
