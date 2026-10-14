import { View } from 'react-native';

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="w-full bg-neutral-card rounded-card p-6 shadow-md shadow-black/10 elevation-md">
      {children}
    </View>
  );
}
