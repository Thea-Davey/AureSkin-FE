import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { useAppStore } from '../store/appStore';
import { theme } from '../theme';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const openMenu = useAppStore((state) => state.openMenu);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
      <View className="flex-row items-center px-5 py-6 mt-2 bg-primary">
        <TouchableOpacity
          onPress={openMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          className="mr-4"
        >
          <Menu size={26} color={theme.colors.card} />
        </TouchableOpacity>

        <Text className="text-h2 font-sans-bold text-neutral-white flex-1">
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
}
