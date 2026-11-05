import { Tabs } from 'expo-router';
import { Home, BookOpen, Scan, Clock, User } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../../shared/theme';
import { AppHeader } from '../../shared/components/AppHeader';
import { MenuOverlay } from '../../shared/components/MenuOverlay';
import { ScanOverlay } from '../../features/scan/view/ScanOverlay';
import { useAppStore } from '../../shared/store/appStore';

export default function TabLayout() {
  const isScanOverlayOpen = useAppStore((state) => state.isScanOverlayOpen);
  const toggleScanOverlay = useAppStore((state) => state.toggleScanOverlay);
  const closeScanOverlay = useAppStore((state) => state.closeScanOverlay);

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: true,
          header: ({ options }) => (
            <AppHeader
              title={typeof options.title === 'string' ? options.title : 'AureSkin'}
            />
          ),
          // tabBarShowLabel: true, // Uncomment to re-enable text labels below icons
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.card,
            elevation: 10,
            height: 72, // original 80
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          listeners={{
            tabPress: (e) => {
              if (isScanOverlayOpen) {
                e.preventDefault();
                closeScanOverlay();
              }
            },
          }}
          options={{
            title: 'Welcome Back!',
            // tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <Home
                color={focused ? theme.colors.primary : theme.colors.muted}
                fill={focused ? theme.colors.primary : 'none'}
                size={24}
                strokeWidth={2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          listeners={{
            tabPress: (e) => {
              if (isScanOverlayOpen) {
                e.preventDefault();
                closeScanOverlay();
              }
            },
          }}
          options={{
            title: 'Library',
            // tabBarLabel: 'Library',
            tabBarIcon: ({ focused }) => (
              <BookOpen
                color={focused ? theme.colors.primary : theme.colors.muted}
                fill={focused ? theme.colors.primary : 'none'}
                size={24}
                strokeWidth={2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              toggleScanOverlay();
            },
          }}
          options={{
            headerShown: false,
            title: 'Skin Analysis',
            // tabBarLabel: 'Scan',
            tabBarButton: () => (
              <View className="flex-1 items-center justify-center">
                {!isScanOverlayOpen ? (
                  <Pressable
                    onPress={toggleScanOverlay}
                    accessibilityRole="button"
                    accessibilityLabel="Open scan options"
                    className="h-20 w-20 -mt-12 items-center justify-center rounded-full bg-primary border-4 border-neutral-white shadow-xl active:opacity-80"
                  >
                    <Scan color={theme.colors.card} size={24} strokeWidth={2.4} />
                    {/* <Text className="text-caption text-neutral-white font-sans-bold mt-1">
                      Scan
                    </Text> */}
                  </Pressable>
                ) : (
                  <View className="h-20 w-20 -mt-12" />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          listeners={{
            tabPress: (e) => {
              if (isScanOverlayOpen) {
                e.preventDefault();
                closeScanOverlay();
              }
            },
          }}
          options={{
            title: 'History',
            // tabBarLabel: 'History',
            tabBarIcon: ({ focused }) => (
              <Clock
                color={focused ? theme.colors.primary : theme.colors.muted}
                fill={focused ? theme.colors.primary : 'none'}
                size={24}
                strokeWidth={2.2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="routine"
          listeners={{
            tabPress: (e) => {
              if (isScanOverlayOpen) {
                e.preventDefault();
                closeScanOverlay();
              }
            },
          }}
          options={{
            title: 'Skincare Routine',
            // tabBarLabel: 'Routine',
            tabBarIcon: ({ focused }) => (
              <User
                color={focused ? theme.colors.primary : theme.colors.muted}
                fill={focused ? theme.colors.primary : 'none'}
                size={24}
                strokeWidth={2.2}
              />
            ),
          }}
        />
      </Tabs>

      {/* Scan Options Overlay (Backdrop + Action Buttons) */}
      <ScanOverlay />

      {/* Persistent Menu Overlay (Opened via Hamburger button) */}
      <MenuOverlay />
    </View>
  );
}
