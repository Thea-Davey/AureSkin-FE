import { View } from 'react-native';

export function IngredientDetailSkeleton() {
  return (
    <View className="px-5 pb-8">
      <View className="mb-4 flex-row items-center gap-2 border-b border-border pb-4">
        <View className="h-6 flex-1 rounded-button bg-background" />
        <View className="h-8 w-24 rounded-badge bg-background" />
        <View className="h-7 w-7 rounded-full bg-background" />
      </View>
      <View className="mb-4 gap-2">
        <View className="h-4 w-full rounded-button bg-background" />
        <View className="h-4 w-11/12 rounded-button bg-background" />
        <View className="h-4 w-4/5 rounded-button bg-background" />
      </View>
      {[0, 1, 2, 3].map((section) => (
        <View
          key={section}
          className="mb-3 rounded-card border border-border bg-card p-4 shadow-sm"
        >
          <View className="mb-3 h-5 w-2/5 rounded-button bg-background" />
          <View className="mb-2 h-4 w-full rounded-button bg-background" />
          <View className="h-4 w-4/5 rounded-button bg-background" />
        </View>
      ))}
    </View>
  );
}
