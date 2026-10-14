import { Tabs } from 'expo-router';
import { Home, BookOpen, Scan, Clock, User } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../../shared/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <BookOpen color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarButton: (props) => (
            <View className="flex-1 items-center justify-center">
              <Pressable
                onPress={props.onPress}
                className="bg-primary h-20 w-20 rounded-full items-center justify-center shadow-lg -mt-14 active:opacity-80"
              >
                <Scan color={theme.colors.card} size={24} />
                <Text className="text-[10px] text-neutral-white font-sans-bold mt-1">Scan</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Clock color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
