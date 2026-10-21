import { View } from 'react-native';

export function RoutineLoadingState() {
  return (
    <View accessibilityLabel="Loading skincare routine" className="gap-4 px-4 py-4">
      <View className="h-40 rounded-card border border-border bg-card p-4">
        <View className="mb-4 h-10 w-2/3 rounded-button bg-background" />
        <View className="h-16 rounded-button bg-background" />
      </View>
      <View className="h-72 rounded-card border border-border bg-card p-5">
        <View className="mb-4 h-8 w-3/4 rounded-button bg-background" />
        <View className="mb-3 h-4 w-full rounded-button bg-background" />
        <View className="mb-8 h-4 w-4/5 rounded-button bg-background" />
        <View className="mb-3 h-5 w-full rounded-button bg-background" />
        <View className="mb-3 h-5 w-full rounded-button bg-background" />
        <View className="h-5 w-2/3 rounded-button bg-background" />
      </View>
    </View>
  );
}