import { View } from 'react-native';

export function ProductDetailSkeleton() {
  return (
    <View className="flex-1 bg-card">
      <View className="h-80 bg-background" />
      <View className="border-b border-border px-5 py-4">
        <View className="h-6 w-3/4 rounded-button bg-background" />
        <View className="mt-2 h-4 w-1/3 rounded-button bg-background" />
        <View className="mt-3 h-6 w-20 rounded-badge bg-background" />
      </View>
      <View className="mx-5 mt-4 rounded-card border border-border bg-card p-4">
        <View className="mb-4 h-6 w-28 rounded-button bg-background" />
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <View key={row} className="mb-3 h-4 w-4/5 rounded-button bg-background" />
        ))}
      </View>
    </View>
  );
}
