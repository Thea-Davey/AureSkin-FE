import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { AppHeader } from '../../shared/components/AppHeader';
import { BottomNavBar } from '../../shared/components/BottomNavBar';
import { FloatingNavBar } from '../../shared/components/FloatingNavBar';
import { MenuOverlay } from '../../shared/components/MenuOverlay';
import { FixedBackgroundPattern } from '../../shared/components/FixedBackgroundPattern';

// Toggle between the new FloatingNavBar (true) and the preserved fixed BottomNavBar (false)
const USE_FLOATING_NAV_BAR = true;

export default function TabLayout() {
  return (
    <View className="flex-1 bg-primary relative">
      <FixedBackgroundPattern />
      <Tabs
        tabBar={(props) =>
          USE_FLOATING_NAV_BAR ? (
            <FloatingNavBar {...props} />
          ) : (
            <BottomNavBar {...props} />
          )
        }
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          sceneStyle: { backgroundColor: 'transparent' },
          header: ({ options }) => (
            <AppHeader
              title={typeof options.title === 'string' ? options.title : 'AureSkin'}
              titleSize={(options as any).titleSize}
              titleClassName={(options as any).titleClassName}
              subtitle={(options as any).subtitle}
              subtitleClassName={(options as any).subtitleClassName}
              transparent
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

      {/* Persistent Menu Overlay (Opened via Hamburger button) */}
      <MenuOverlay />
    </View>
  );
}
