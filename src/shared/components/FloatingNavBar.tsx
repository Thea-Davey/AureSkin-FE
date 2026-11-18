import React, { ComponentProps } from 'react';
import { Image, ImageSourcePropType, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, useRouter } from 'expo-router';
import { theme } from '../theme';
import { useAppStore } from '../store/appStore';

type TabsProps = ComponentProps<typeof Tabs>;
export type FloatingNavBarProps = Parameters<NonNullable<TabsProps['tabBar']>>[0];

const NAV_ICONS: Record<string, { default: ImageSourcePropType; selected: ImageSourcePropType }> = {
  index: {
    default: require('../../../assets/images/home.png'),
    selected: require('../../../assets/images/home-select.png'),
  },
  library: {
    default: require('../../../assets/images/library.png'),
    selected: require('../../../assets/images/library-select.png'),
  },
  history: {
    default: require('../../../assets/images/history.png'),
    selected: require('../../../assets/images/history-select.png'),
  },
  routine: {
    default: require('../../../assets/images/routine.png'),
    selected: require('../../../assets/images/routine-select.png'),
  },
};

const SCAN_LOGO_ICON: ImageSourcePropType = require('../../../assets/images/logo-white.png');

/**
 * FloatingNavBar
 * Standalone floating pill bottom navigation bar for AureSkin's main tabs layout.
 * Designed as a non-destructive drop-in replacement for the fixed BottomNavBar:
 * - Floats over screen content via absolute positioning with passthrough outer margins
 * - Rounded pill container (`rounded-badge`) with soft diffused elevation drop shadow
 * - Prominent raised circular center AureSkin Scan FAB routing to `/scan/setup`
 * - Strict adherence to AureSkin NativeWind and theme.colors design tokens
 */
export function FloatingNavBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets: propInsets,
}: FloatingNavBarProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = propInsets ?? safeAreaInsets;
  const router = useRouter();

  const isScanOverlayOpen = useAppStore((s) => s.isScanOverlayOpen);
  const closeScanOverlay = useAppStore((s) => s.closeScanOverlay);

  const renderTabIcon = (routeName: string, isFocused: boolean) => {
    const iconEntry = NAV_ICONS[routeName];
    if (!iconEntry) {
      return null;
    }

    const iconSize = isFocused ? 36 : 28;

    return (
      <Image
        source={isFocused ? iconEntry.selected : iconEntry.default}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />
    );
  };

  const handleTabPress = (route: (typeof state.routes)[number], isFocused: boolean) => {
    if (route.name === 'scan') {
      router.push('/scan/setup');
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

  const bottomOffset = Math.max(insets?.bottom ?? 0, 12) + 12;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: bottomOffset,
      }}
      className="px-5"
    >
      {/* Floating Rounded Pill Container */}
      <View
        style={{
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
          elevation: 12,
        }}
        className="h-16 flex-row items-center rounded-badge bg-card px-2"
      >
        {state.routes.map((route, index: number) => {
          const isFocused = state.index === index;
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};

          // Center Raised Circular Scan / Camera Action Button
          if (route.name === 'scan') {
            return (
              <View key={route.key} className="flex-1 items-center justify-center">
                <Pressable
                  onPress={() => router.push('/scan/setup')}
                  accessibilityRole="button"
                  accessibilityLabel="Set up your skin analysis"
                  style={{
                    shadowColor: theme.colors.black,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.16,
                    shadowRadius: 8,
                    elevation: 0,
                  }}
                  className="-mt-8 h-20 w-20 items-center justify-center rounded-full border-4 border-neutral-white bg-primary active:opacity-85"
                >
                  <Image
                    source={SCAN_LOGO_ICON}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                </Pressable>
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
              className="h-full flex-1 items-center justify-center active:opacity-70"
            >
              {renderTabIcon(route.name, isFocused)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default FloatingNavBar;

