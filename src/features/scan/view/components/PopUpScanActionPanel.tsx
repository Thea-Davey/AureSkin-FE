import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { PopUpPanel } from '@/shared/components';
import { theme } from '@/shared/theme';

export interface PopUpScanActionPanelProps {
  visible: boolean;
  onClose: () => void;
  onDeletePress: () => void;
}

/**
 * Bottom action sheet panel for scan results screen.
 * Uses the blueprint PopUpPanel (Style 2: content-only) with smooth spring transitions.
 */
export function PopUpScanActionPanel({
  visible,
  onClose,
  onDeletePress,
}: PopUpScanActionPanelProps) {
  return (
    <PopUpPanel
      visible={visible}
      title="Scan actions"
      subtitle="Manage this scan record"
      style={2}
      onClose={onClose}
    >
      <View className="py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete this scan record"
          onPress={() => {
            onClose();
            onDeletePress();
          }}
          className="flex-row items-center rounded-card border border-status-error/25 bg-status-error/5 p-4 active:opacity-70"
        >
          <View className="mr-3.5 h-11 w-11 items-center justify-center rounded-full bg-status-error/15">
            <Trash2 size={20} color={theme.colors.status.error} />
          </View>
          <View className="flex-1">
            <Text className="text-body-sm font-sans-bold text-status-error">
              Delete scan record
            </Text>
            <Text className="mt-0.5 text-caption font-sans text-muted">
              Permanently remove this analysis from your history
            </Text>
          </View>
        </Pressable>
      </View>
    </PopUpPanel>
  );
}

export default PopUpScanActionPanel;

