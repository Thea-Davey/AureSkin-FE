import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { AppHeader } from '../../shared/components/AppHeader';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { MenuOverlay } from '../../shared/components/MenuOverlay';
import { ScanOverlay } from '../../features/scan/view/ScanOverlay';

export default function TabLayout() {
  return (
    <View className="flex-1">
      <Tabs
        tabBar={(props) => <BottomNavBar {...props} />}
        screenOptions={{
          headerShown: true,
          header: ({ options }) => (
            <AppHeader
              title={typeof options.title === 'string' ? options.title : 'AureSkin'}
              titleSize={(options as any).titleSize}
              titleClassName={(options as any).titleClassName}
              subtitle={(options as any).subtitle}
              subtitleClassName={(options as any).subtitleClassName}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Welcome Back!',
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            headerShown: false,
            title: 'Skin Analysis',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: 'Skincare Routine',
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
