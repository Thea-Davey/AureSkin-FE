import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { CloseButton } from './CloseButton';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
      <View className="flex-row items-center justify-between px-5 py-5 bg-primary">
        <Text className="text-h2 font-sans-bold text-neutral-white flex-1 mr-3" numberOfLines={1}>
          {title}
        </Text>
        <CloseButton
          onPress={handleClose}
          iconSize={24}
          accessibilityLabel="Close screen"
        />
      </View>
    </SafeAreaView>
  );
}

export default ModalHeader;
