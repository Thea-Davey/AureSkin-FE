import { View } from 'react-native';

export function IngredientListSkeleton() {
  return (
    <View accessibilityLabel="Loading ingredients" className="px-5 pt-3">
      {Array.from({ length: 5 }, (_, index) => (
        <View
          key={index}
          className="mb-3 rounded-card border border-border bg-card p-4 shadow-sm"
        >
          <View className="h-5 w-1/3 rounded-badge bg-neutral-offwhite" />
          <View className="mt-2 h-4 w-4/5 rounded-badge bg-neutral-offwhite" />
          <View className="mt-1 h-4 w-2/3 rounded-badge bg-neutral-offwhite" />
        </View>
      ))}
    </View>
  );
}
