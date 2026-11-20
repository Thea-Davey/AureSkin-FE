import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { theme } from '../theme';

export interface BackendUpdateDialogProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  body?: string | React.ReactNode;
  dismissLabel?: string;
  reloadLabel?: string;
  onDismiss: () => void;
  onReload: () => void;
  onClose?: () => void;
  testID?: string;
}

/**
 * UpdateRobotIcon
 * Clean SVG symbol featuring a robot head framed by circular update arrows
 * matching the user's reference design.
 */
export const UpdateRobotIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 54,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Circular Reload Arrows */}
    {/* Top-Right Arc with Arrowhead */}
    <Path
      d="M32 10C42 10 50.5 17 52.8 26.5"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <Path
      d="M48 27L53 28L55 22"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Bottom-Left Arc with Arrowhead */}
    <Path
      d="M32 54C22 54 13.5 47 11.2 37.5"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <Path
      d="M16 37L11 36L9 42"
      stroke={color}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Center Robot Head */}
    {/* Antenna left & right */}
    <Line x1="26" y1="23" x2="22" y2="18" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    <Line x1="38" y1="23" x2="42" y2="18" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    {/* Dome Head */}
    <Path
      d="M20 37C20 27 24 23 32 23C40 23 44 27 44 37H20Z"
      stroke={color}
      strokeWidth="3.2"
      strokeLinejoin="round"
    />
    {/* Eyes */}
    <Circle cx="26.5" cy="31" r="2.2" stroke={color} strokeWidth="2.4" fill="none" />
    <Circle cx="37.5" cy="31" r="2.2" stroke={color} strokeWidth="2.4" fill="none" />
  </Svg>
);

/**
 * BackendUpdateDialog
 * Shared global modal notification dialog shown when a new backend update / version
 * is detected, notifying users that an app reload is required.
 * Adheres strictly to AureSkin NativeWind design presets and theme tokens.
 */
export function BackendUpdateDialog({
  visible,
  title = 'Backend Update Detected',
  subtitle = 'A new update is available on the backend. An app reload is required to apply the latest changes.',
  body = 'Would you like to reload the app now?',
  dismissLabel = 'Reload Later',
  reloadLabel = 'Reload App Now',
  onDismiss,
  onReload,
  onClose,
  testID = 'backend-update-dialog',
}: BackendUpdateDialogProps) {
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
            accessibilityLabel="Close backend update dialog backdrop"
            onPress={handleClose}
            className="flex-1"
          />
        </View>

        {/* Dialog Card with rounded-card and primary theme */}
        <View className="relative w-full max-w-[340px] overflow-hidden rounded-card bg-primary shadow-2xl">
          {/* Top Banner (Deep Olive Green / Primary #6B7B4C) */}
          <View className="relative items-center bg-primary px-6 pb-6 pt-7">
            {/* Top-Right Close Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close backend update notification"
              onPress={handleClose}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 p-1 active:opacity-70"
            >
              <X size={18} color={theme.colors.white} />
            </Pressable>

            {/* Banner Icon: Update Robot */}
            <View className="mb-3 h-14 w-14 items-center justify-center">
              <UpdateRobotIcon size={52} color={theme.colors.white} />
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
            {/* Body */}
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
              {/* Dismiss / Reload Later Button (Outline) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss and reload later"
                onPress={onDismiss}
                className="flex-1 items-center justify-center rounded-button border border-border py-3 bg-card active:opacity-75"
              >
                <Text className="text-body-sm font-sans-semibold text-text">
                  {dismissLabel}
                </Text>
              </Pressable>

              {/* Reload App Now Button (Filled Primary) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reload application now"
                onPress={onReload}
                className="flex-1 items-center justify-center rounded-button bg-primary py-3 active:opacity-80 shadow-xs"
              >
                <Text className="text-body-sm font-sans-bold text-neutral-white">
                  {reloadLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BackendUpdateDialog;
