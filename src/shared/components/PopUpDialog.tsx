import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { theme } from '../theme';
import { Button } from './Button';

export interface PopUpDialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  textClassName?: string;
}

export interface PopUpDialogProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  body?: string | React.ReactNode;
  onClose?: () => void;
  actions?: PopUpDialogAction[];
  /**
   * Action buttons arrangement:
   * 'column' (Recommended for 3 buttons on mobile to prevent text squishing)
   * 'row' (Horizontal row)
   * Default: 'column' when 3 actions, 'row' when <= 2
   */
  layout?: 'column' | 'row';
  testID?: string;
}

/**
 * PopUpDialog Shared Component
 * Flexible modal dialog supporting title, description, and 1 to 3 actions.
 * Adheres strictly to AureSkin NativeWind design presets and theme tokens.
 */
export function PopUpDialog({
  visible,
  title,
  subtitle,
  body,
  onClose,
  actions = [],
  layout,
  testID,
}: PopUpDialogProps) {
  const isColumnLayout = layout ? layout === 'column' : actions.length >= 3;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop */}
        <View className="absolute inset-0 bg-black/60">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close dialog backdrop"
            onPress={onClose}
            className="flex-1"
          />
        </View>

        {/* Dialog Card */}
        <View className="relative w-full max-w-[340px] overflow-hidden rounded-card bg-card p-6 shadow-2xl">
          {/* Top-Right Close Button */}
          {onClose && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={onClose}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 p-1 active:opacity-70"
            >
              <X size={18} color={theme.colors.text} />
            </Pressable>
          )}

          {/* Header Row */}
          <View className="flex-row items-center pr-6 mb-3">
            <View className="h-10 w-10 items-center justify-center rounded-card bg-primary/10 mr-3">
              <AlertCircle size={22} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-h3 font-sans-bold text-text" numberOfLines={2}>
                {title}
              </Text>
              {subtitle && (
                <Text className="text-caption font-sans text-muted mt-0.5">
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Body Content */}
          {body && (
            <View className="mb-6">
              {typeof body === 'string' ? (
                <Text className="text-body-sm font-sans text-text leading-5">
                  {body}
                </Text>
              ) : (
                body
              )}
            </View>
          )}

          {/* Action Buttons */}
          {actions.length > 0 && (
            <View className={isColumnLayout ? 'gap-2.5 mt-2' : 'flex-row items-center gap-3 mt-4'}>
              {actions.map((act, index) => {
                if (act.variant === 'ghost' || act.variant === 'danger') {
                  const textColor =
                    act.variant === 'danger' ? 'text-status-error' : 'text-muted';
                  return (
                    <Pressable
                      key={index}
                      onPress={act.onPress}
                      accessibilityRole="button"
                      accessibilityLabel={act.label}
                      className="py-2.5 items-center justify-center active:opacity-70"
                    >
                      <Text
                        className={`text-body-sm font-sans-semibold ${textColor} ${act.textClassName || ''}`}
                      >
                        {act.label}
                      </Text>
                    </Pressable>
                  );
                }

                return (
                  <Button
                    key={index}
                    variant={act.variant || (index === 0 ? 'primary' : 'outline')}
                    size="md"
                    title={act.label}
                    onPress={act.onPress}
                    fullWidth={isColumnLayout}
                    className={!isColumnLayout ? 'flex-1' : ''}
                    textClassName={act.textClassName}
                  />
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default PopUpDialog;

