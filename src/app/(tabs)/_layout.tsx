import { Tabs } from 'expo-router';
import { Home, BookOpen, Scan, Clock, User } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../../shared/theme';
import { AppHeader } from '../../shared/components/AppHeader';
import { MenuOverlay } from '../../shared/components/MenuOverlay';

export default function TabLayout() {
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
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.muted,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.card,
            elevation: 10,
            height: 80,
            paddingBottom: 8,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Welcome Back!',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarLabel: 'Library',
            tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Skin Analysis',
            tabBarLabel: 'Scan',
            tabBarButton: (props) => (
              <View className="flex-1 items-center justify-center">
                <Pressable
                  onPress={props.onPress}
                  className="bg-primary h-20 w-20 rounded-full items-center justify-center shadow-lg -mt-14 active:opacity-80"
                >
                  <Scan color={theme.colors.card} size={24} />
                  <Text className="text-caption text-neutral-white font-sans-bold mt-1">Scan</Text>
                </Pressable>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarLabel: 'History',
            tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: 'Skincare Routine',
            tabBarLabel: 'Routine',
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>

      {/* Persistent Menu Overlay (Opened via Hamburger button) */}
      <MenuOverlay />
    </View>
  );
}
