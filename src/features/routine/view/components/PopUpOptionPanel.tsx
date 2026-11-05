import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Sparkles, Trash2 } from 'lucide-react-native';
import { PopUpPanel } from '@/shared/components';
import { theme } from '@/shared/theme';

export interface PopUpOptionPanelProps {
  visible: boolean;
  onClose: () => void;
  onGenerateNewRoutine: () => void;
  onDeleteCurrentRoutine: () => void;
}

/**
 * Local PopUpOptionPanel component for Routine actions.
 * Uses global blueprint PopUpPanel (Style 2: no default footer buttons).
 */
export function PopUpOptionPanel({
  visible,
  onClose,
  onGenerateNewRoutine,
  onDeleteCurrentRoutine,
}: PopUpOptionPanelProps) {
  const handleGenerate = () => {
    onClose();
    onGenerateNewRoutine();
  };

  const handleDelete = () => {
    onClose();
    onDeleteCurrentRoutine();
  };

  return (
    <PopUpPanel
      visible={visible}
      title="Routine Options"
      style={2}
      onClose={onClose}
    >
      {/* Action Options List */}
      <View className="gap-2.5">
        {/* Option 1: Generate New Routine */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Generate New Routine"
          onPress={handleGenerate}
          className="flex-row items-center rounded-button bg-primary/10 p-4 active:opacity-75"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Sparkles size={20} color={theme.colors.white} />
          </View>
          <View className="flex-1">
            <Text className="text-body-sm font-sans-bold text-text">
              Generate New Routine
            </Text>
            <Text className="mt-0.5 text-caption font-sans text-muted">
              Create a fresh regimen matching your latest scan
            </Text>
          </View>
        </Pressable>

        {/* Option 2: Delete Current Routine */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete Current Routine"
          onPress={handleDelete}
          className="flex-row items-center rounded-button bg-status-error/10 p-4 active:opacity-75"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-status-error">
            <Trash2 size={20} color={theme.colors.white} />
          </View>
          <View className="flex-1">
            <Text className="text-body-sm font-sans-bold text-error">
              Delete Current Routine
            </Text>
            <Text className="mt-0.5 text-caption font-sans text-muted">
              Remove this regimen and return to an unconfigured state
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Cancel Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        onPress={onClose}
        className="mt-4 items-center justify-center rounded-button border border-border py-3.5 active:opacity-70"
      >
        <Text className="text-body-sm font-sans-semibold text-text">Cancel</Text>
      </Pressable>
    </PopUpPanel>
  );
}

