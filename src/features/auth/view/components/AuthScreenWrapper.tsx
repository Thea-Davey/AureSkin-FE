import { KeyboardAvoidingView, Platform, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AuthScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center p-6 pt-2 pb-8">
            <Text className="text-display font-heading text-neutral-white mb-6">
              AureSkin
            </Text>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
