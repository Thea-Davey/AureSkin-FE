import { View, Text, Pressable } from 'react-native';
import { supabase } from '../../shared/services/supabase';

export default function HomeScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View className="flex-1 items-center justify-center bg-neutral-offwhite">
      <Text className="text-h2 font-sans-bold text-neutral-text mb-4">Home Screen</Text>
      
      <Pressable 
        onPress={handleLogout}
        className="px-6 py-3 bg-secondary rounded-button active:bg-secondary-dark"
      >
        <Text className="text-neutral-white font-sans-semibold text-body">
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}
