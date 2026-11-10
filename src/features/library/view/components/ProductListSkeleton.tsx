import { View } from 'react-native';

export function ProductListSkeleton() {
  return (
    <View accessibilityLabel="Loading products" className="w-full pt-1">
      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={index}
          className="mb-3 min-h-28 flex-row items-center rounded-card border border-border bg-card p-3 shadow-xs"
        >
          <View className="h-24 w-24 rounded-button bg-neutral-offwhite shrink-0" />
          <View className="ml-4 flex-1 gap-2 self-stretch justify-center py-1">
            <View className="h-4 w-4/5 rounded-button bg-neutral-offwhite" />
            <View className="h-3 w-1/2 rounded-button bg-neutral-offwhite" />
            <View className="mt-1 h-5 w-20 rounded-badge bg-secondary/20" />
          </View>
          <View className="h-5 w-5 rounded-full bg-neutral-offwhite self-start mt-1 mr-1" />
        </View>
      ))}
    </View>
  );
}
