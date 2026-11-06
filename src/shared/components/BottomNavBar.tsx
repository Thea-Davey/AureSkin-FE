import React, { ComponentProps } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Scan, Clock, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { theme } from '../theme';
import { useAppStore } from '../store/appStore';

type TabsProps = ComponentProps<typeof Tabs>;
export type BottomNavBarProps = Parameters<NonNullable<TabsProps['tabBar']>>[0];

/**
 * BottomNavBar
 * Global shared bottom tab navigation bar for AureSkin main tabs layout.
 * Features:
 * - Tab items for Home, Library, Scan, History, and Routine
 * - Prominent raised center Scan button with overlay toggle
 * - Safe area handling for Android & iOS home indicator
 * - Soft drop shadow matching AureSkin design system
 */
export function BottomNavBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets: propInsets,
}: BottomNavBarProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = propInsets ?? safeAreaInsets;

  const isScanOverlayOpen = useAppStore((state) => state.isScanOverlayOpen);
  const toggleScanOverlay = useAppStore((state) => state.toggleScanOverlay);
  const closeScanOverlay = useAppStore((state) => state.closeScanOverlay);

  const renderTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? theme.colors.primary : theme.colors.muted;
    const iconFill = isFocused ? theme.colors.primary : 'none';

    switch (routeName) {
      case 'index':
        return (
          <Home
            color={iconColor}
            fill={iconFill}
            size={24}
            strokeWidth={2.2}
          />
        );
      case 'library':
        return (
          <BookOpen
            color={iconColor}
            fill={iconFill}
            size={24}
            strokeWidth={2.2}
          />
        );
      case 'history':
        return (
          <Clock
            color={iconColor}
            fill={iconFill}
            size={24}
            strokeWidth={2.2}
          />
        );
      case 'routine':
        return (
          <User
            color={iconColor}
            fill={iconFill}
            size={24}
            strokeWidth={2.2}
          />
        );
      default:
        return null;
    }
  };

  const handleTabPress = (route: (typeof state.routes)[number], isFocused: boolean) => {
    if (route.name === 'scan') {
      toggleScanOverlay();
      return;
    }

    if (isScanOverlayOpen) {
      closeScanOverlay();
    }

    const event = emitter.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigateToTab(route.key);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets?.bottom ?? 0, 8),
        },
      ]}
    >
      {state.routes.map((route, index: number) => {
        const isFocused = state.index === index;
        const descriptor = descriptors[route.key];
        const options = descriptor?.options ?? {};

        // Center Scan Button (Floating action)
        if (route.name === 'scan') {
          return (
            <View key={route.key} className="flex-1 items-center justify-center">
              {!isScanOverlayOpen ? (
                <Pressable
                  onPress={toggleScanOverlay}
                  accessibilityRole="button"
                  accessibilityLabel="Open scan options"
                  className="h-20 w-20 -mt-12 items-center justify-center rounded-full bg-primary border-4 border-neutral-white shadow-xl active:opacity-80"
                >
                  <Scan color={theme.colors.card} size={24} strokeWidth={2.4} />
                </Pressable>
              ) : (
                <View className="h-20 w-20 -mt-12" />
              )}
            </View>
          );
        }

        const accessibilityLabel =
          options.tabBarAccessibilityLabel ||
          (typeof options.title === 'string' ? `${options.title} tab` : `${route.name} tab`);

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={accessibilityLabel}
            onPress={() => handleTabPress(route, isFocused)}
            className="flex-1 items-center justify-center py-2 active:opacity-75"
          >
            {renderTabIcon(route.name, isFocused)}
          </Pressable>
        );
      })}
    </View>
  );
}

// Named alias so either BottomNavBar or AppBottomNavBar can be imported
export { BottomNavBar as AppBottomNavBar };

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderTopColor: theme.colors.card,
    height: 72,
    paddingTop: 8,
    shadowColor: theme.colors.black ?? '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
});
