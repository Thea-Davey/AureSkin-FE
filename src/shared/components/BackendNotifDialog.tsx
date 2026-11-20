import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { theme } from '../theme';

export interface BackendNotifDialogProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  body?: string | React.ReactNode;
  iconVariant?: 'triangle' | 'robot';
  dismissLabel?: string;
  homeLabel?: string;
  onDismiss: () => void;
  onGoHome: () => void;
  onClose?: () => void;
  testID?: string;
}

/**
 * RobotFailIcon
 * Renders the robot fail illustration matching AureSkin design reference
 * with antenna, dead eyes (x x), and status line.
 */
const RobotFailIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 48,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Antenna */}
    <Circle cx="32" cy="10" r="4" fill={color} />
    <Line x1="32" y1="14" x2="32" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Head Container */}
    <Rect x="14" y="20" width="36" height="28" rx="8" stroke={color} strokeWidth="3.5" />
    {/* Left & Right Ears */}
    <Rect x="9" y="30" width="5" height="8" rx="2" fill={color} />
    <Rect x="50" y="30" width="5" height="8" rx="2" fill={color} />
    {/* Left Eye: X */}
    <Line x1="22" y1="29" x2="28" y2="35" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="28" y1="29" x2="22" y2="35" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Right Eye: X */}
    <Line x1="36" y1="29" x2="42" y2="35" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <Line x1="42" y1="29" x2="36" y2="35" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Flat Mouth */}
    <Line x1="25" y1="41" x2="39" y2="41" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

/**
 * BackendNotifDialog
 * Global server failure modal notification dialog styled with the concern color token (#FA8B89).
 * Displays when the backend server crashes or returns connection drop / 50x errors.
 * Reassures users and invites them to browse local library and scan history while fixing.
 */
export function BackendNotifDialog({
  visible,
  title = 'Backend Server is currently down',
  subtitle = 'Developer is working on fixing it',
  body = 'While the problem is currently being fixed, you can browse our library and history at the moment.',
  iconVariant = 'triangle',
  dismissLabel = 'Dismiss',
  homeLabel = 'Go Home',
  onDismiss,
  onGoHome,
  onClose,
  testID = 'backend-notif-dialog',
}: BackendNotifDialogProps) {
  const handleClose = onClose ?? onDismiss;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID={testID}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop */}
        <View className="absolute inset-0 bg-black/60">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close backend notification dialog backdrop"
            onPress={handleClose}
            className="flex-1"
          />
        </View>

        {/* Dialog Card with rounded-card and concern theme */}
        <View className="relative w-full max-w-[340px] overflow-hidden rounded-card bg-concern shadow-2xl">
          {/* Top Banner (Concern Red/Coral #FA8B89) */}
          <View className="relative items-center bg-concern px-6 pb-6 pt-7">
            {/* Top-Right Close Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close backend server notification"
              onPress={handleClose}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 p-1 active:opacity-70"
            >
              <X size={18} color={theme.colors.white} />
            </Pressable>

            {/* Banner Icon */}
            <View className="mb-3 h-14 w-14 items-center justify-center">
              {iconVariant === 'robot' ? (
                <RobotFailIcon size={46} color={theme.colors.white} />
              ) : (
                <AlertTriangle size={44} color={theme.colors.white} strokeWidth={2.4} />
              )}
            </View>

            {/* Title */}
            <Text className="text-center text-h2 font-sans-bold text-neutral-white">
              {title}
            </Text>

            {/* Subtitle */}
            {subtitle ? (
              <Text className="mt-1 text-center text-body-sm font-sans text-neutral-white/90">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Bottom Card Content */}
          <View className="rounded-t-card bg-card p-6">
            {/* Body Description */}
            <View className="mb-6">
              {typeof body === 'string' ? (
                <Text className="text-body-sm font-sans text-text leading-5">
                  {body}
                </Text>
              ) : (
                body
              )}
            </View>

            {/* Dual Action Buttons */}
            <View className="flex-row items-center gap-3">
              {/* Dismiss Button (Outline) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss backend server notification"
                onPress={onDismiss}
                className="flex-1 items-center justify-center rounded-button border border-border py-3 bg-card active:opacity-75"
              >
                <Text className="text-body-sm font-sans-bold text-text">
                  {dismissLabel}
                </Text>
              </Pressable>

              {/* Go Home Button (Filled Concern Color) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Navigate to home screen"
                onPress={onGoHome}
                style={{ backgroundColor: theme.colors.concern }}
                className="flex-1 items-center justify-center rounded-button py-3 active:opacity-80 shadow-xs"
              >
                <Text className="text-body-sm font-sans-bold text-neutral-white">
                  {homeLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BackendNotifDialog;

