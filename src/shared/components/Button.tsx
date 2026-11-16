import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-danger'
  | 'danger'
  | 'white'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'rounded' | 'pill' | 'card' | 'input';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Label text for the button */
  title?: string;
  /** Custom inner children layout */
  children?: React.ReactNode;

  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset controlling padding and font size */
  size?: ButtonSize;
  /** Border radius shape preset */
  shape?: ButtonShape;

  /** Stretches width to 100% of parent container */
  fullWidth?: boolean;
  /** Shows loading indicator */
  isLoading?: boolean;
  /** Disables click interaction */
  disabled?: boolean;

  /** Left-aligned icon or render prop accepting color and size */
  leftIcon?: React.ReactNode | ((props: { color: string; size: number }) => React.ReactNode);
  /** Right-aligned icon or render prop accepting color and size */
  rightIcon?: React.ReactNode | ((props: { color: string; size: number }) => React.ReactNode);

  /** Additional Tailwind / NativeWind classes for the container */
  className?: string;
  /** Additional Tailwind / NativeWind classes for the label text */
  textClassName?: string;

  /** Custom text color override (if necessary) */
  textColor?: string;
  /** Transform title text to uppercase with tracking */
  uppercase?: boolean;

  /** Optional React Native container style */
  style?: StyleProp<ViewStyle>;
  /** Optional React Native text style */
  textStyle?: StyleProp<TextStyle>;
  /** Custom ActivityIndicator color */
  loadingColor?: string;
}

const VARIANT_CONTAINER_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:opacity-90',
  secondary: 'bg-secondary active:opacity-90 shadow-sm',
  outline: 'border border-border bg-card active:bg-neutral-offwhite',
  'outline-primary': 'border border-primary bg-card active:bg-primary/10',
  'outline-secondary': 'border border-secondary bg-card active:bg-secondary/10',
  'outline-danger': 'border border-error bg-card active:bg-status-error/10',
  danger: 'bg-status-error active:opacity-85',
  white: 'bg-neutral-white active:opacity-90 shadow-sm',
  ghost: 'bg-transparent active:bg-neutral-border/30',
};

const VARIANT_TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: 'text-neutral-white font-sans-semibold',
  secondary: 'text-neutral-white font-sans-bold',
  outline: 'text-text font-sans-semibold',
  'outline-primary': 'text-primary font-sans-semibold',
  'outline-secondary': 'text-secondary font-sans-semibold',
  'outline-danger': 'text-error font-sans-semibold',
  danger: 'text-neutral-white font-sans-semibold',
  white: 'text-neutral-text font-sans-bold',
  ghost: 'text-primary font-sans-semibold',
};

const SIZE_CONTAINER_STYLES: Record<ButtonSize, string> = {
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-3.5 px-5',
};

const SIZE_TEXT_STYLES: Record<ButtonSize, string> = {
  sm: 'text-caption',
  md: 'text-body-sm',
  lg: 'text-label',
};

const SHAPE_STYLES: Record<ButtonShape, string> = {
  rounded: 'rounded-button',
  pill: 'rounded-full',
  card: 'rounded-card',
  input: 'rounded-input',
};

const VARIANT_DEFAULT_COLORS: Record<ButtonVariant, string> = {
  primary: theme.colors.white,
  secondary: theme.colors.white,
  outline: theme.colors.text,
  'outline-primary': theme.colors.primary,
  'outline-secondary': theme.colors.secondary,
  'outline-danger': theme.colors.error,
  danger: theme.colors.white,
  white: theme.colors.text,
  ghost: theme.colors.primary,
};

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  textClassName = '',
  textColor,
  uppercase = false,
  style,
  textStyle,
  loadingColor,
  accessibilityLabel,
  accessibilityRole = 'button',
  ...rest
}) => {
  const isInteractiveDisabled = disabled || isLoading;
  const defaultIconColor = textColor || VARIANT_DEFAULT_COLORS[variant];
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  const containerClasses = [
    'flex-row items-center justify-center',
    SHAPE_STYLES[shape],
    VARIANT_CONTAINER_STYLES[variant],
    SIZE_CONTAINER_STYLES[size],
    fullWidth ? 'w-full' : '',
    isInteractiveDisabled ? 'opacity-60' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    VARIANT_TEXT_STYLES[variant],
    SIZE_TEXT_STYLES[size],
    uppercase ? 'uppercase tracking-wider' : '',
    textClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const renderIcon = (
    icon: React.ReactNode | ((props: { color: string; size: number }) => React.ReactNode)
  ) => {
    if (typeof icon === 'function') {
      return icon({ color: defaultIconColor, size: iconSize });
    }
    return icon;
  };

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isInteractiveDisabled, busy: isLoading }}
      disabled={isInteractiveDisabled}
      className={containerClasses}
      style={style}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          color={loadingColor || defaultIconColor}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : children ? (
        children
      ) : (
        <>
          {leftIcon ? (
            <View className="mr-2 items-center justify-center">
              {renderIcon(leftIcon)}
            </View>
          ) : null}

          {title ? (
            <Text
              className={labelClasses}
              style={[textColor ? { color: textColor } : undefined, textStyle]}
            >
              {title}
            </Text>
          ) : null}

          {rightIcon ? (
            <View className="ml-2 items-center justify-center">
              {renderIcon(rightIcon)}
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
};

export default Button;

