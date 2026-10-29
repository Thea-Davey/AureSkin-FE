import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface ProductAddedConfirmationProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
}

const DISPLAY_DURATION_MS = 1500;
const EXIT_DURATION_MS = 180;

export function ProductAddedConfirmation({
  visible,
  onDismiss,
  title = 'Product added!',
  message,
}: ProductAddedConfirmationProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.9));
  const isDismissing = useRef(false);

  const dismiss = useCallback(() => {
    if (isDismissing.current) {
      return;
    }

    isDismissing.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });
  }, [onDismiss, opacity, scale]);

  useEffect(() => {
    if (!visible) {
      isDismissing.current = false;
      opacity.setValue(0);
      scale.setValue(0.9);
      return undefined;
    }

    isDismissing.current = false;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId = setTimeout(dismiss, DISPLAY_DURATION_MS);
    return () => clearTimeout(timeoutId);
  }, [dismiss, opacity, scale, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-black/50"
          style={{ opacity }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss product added confirmation"
          onPress={dismiss}
          className="absolute inset-0"
        />
        <Animated.View
          accessibilityRole="alert"
          accessibilityLabel={message ? `${title} ${message}` : title}
          className="mx-8 w-full max-w-[320px] items-center rounded-card bg-card px-8 py-7 shadow-lg"
          style={{ opacity, transform: [{ scale }] }}
        >
          <View
            className="mb-4 h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.colors.primary}4D` }}
          >
            <Check size={32} color={theme.colors.white} strokeWidth={3} />
          </View>
          <Text className="text-center text-h3 font-sans-bold text-text">
            {title}
          </Text>
          {message ? (
            <Text className="mt-2 text-center text-body-sm font-sans text-muted">
              {message}
            </Text>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
