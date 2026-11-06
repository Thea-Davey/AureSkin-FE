import React from 'react';
import {
  View,
  ViewProps,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { theme } from '../theme';

export interface CardProps extends Omit<ViewProps, 'style'> {
  children?: React.ReactNode;
  className?: string;
  /**
   * Layout style preset:
   * - 1 (default): Standard card container with soft natural drop shadow
   * - 2: Centered info/footer card (`bg-card rounded-card border border-border p-5 mt-3 mb-2 items-center shadow-sm`)
   *
   * Or pass a standard React Native StyleProp<ViewStyle> object.
   */
  style?: 1 | 2 | StyleProp<ViewStyle>;
  /**
   * Explicit variant prop alias (1 | 2):
   * - 1: Standard card container
   * - 2: Centered info/footer card
   */
  variant?: 1 | 2;
  /** Optional onPress callback. If provided, renders an accessible Pressable card */
  onPress?: PressableProps['onPress'];
  /** Optional activeOpacity when pressed (default: 0.85 when onPress is provided) */
  activeOpacity?: number;
  /** Accessibility role (defaults to 'button' if onPress is present) */
  accessibilityRole?: PressableProps['accessibilityRole'];
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Accessibility state */
  accessibilityState?: PressableProps['accessibilityState'];
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Global Card component for AureSkin.
 * - Style 1 (default): Standard card container (`bg-card border border-border rounded-card` with soft natural drop shadow)
 * - Style 2: Centered info/footer card (`bg-card rounded-card border border-border p-5 mt-3 mb-2 items-center shadow-sm`)
 * - Transparently handles static (`View`) or interactive (`Pressable`) containers
 */
export function Card({
  children,
  className = '',
  style,
  variant,
  onPress,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}: CardProps) {
  // Resolve variant: check variant prop first, or style if passed as number 1 | 2
  const activeVariant: 1 | 2 =
    variant ?? (typeof style === 'number' ? (style as 1 | 2) : 1);
  const inlineStyle = typeof style === 'object' ? style : undefined;

  const isStyle2 = activeVariant === 2;

  const hasCustomBg = /\bbg-/.test(className);
  const defaultBg = hasCustomBg ? '' : 'bg-card ';

  const hasCustomBorder = /\bborder(-|$)/.test(className);
  const defaultBorder = hasCustomBorder ? '' : 'border border-border ';

  const hasCustomAlign = /\bitems-/.test(className);
  const alignClass = isStyle2 && !hasCustomAlign ? 'items-center ' : '';
  const style2Classes = isStyle2 ? `${alignClass}shadow-sm ` : '';
  const cardClasses = `${defaultBg}${defaultBorder}rounded-card ${style2Classes}${className}`;
  const shadowStyle = isStyle2 ? styles.cardShadowSm : styles.cardShadow;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        className={`${cardClasses} active:opacity-85`}
        style={[shadowStyle, inlineStyle]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      className={cardClasses}
      style={[shadowStyle, inlineStyle]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: theme.colors.black ?? '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardShadowSm: {
    shadowColor: theme.colors.black ?? '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default Card;

