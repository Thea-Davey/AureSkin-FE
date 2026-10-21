import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

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
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          accessibilityLabel="Close screen"
        >
          <X size={24} color={theme.colors.card} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
