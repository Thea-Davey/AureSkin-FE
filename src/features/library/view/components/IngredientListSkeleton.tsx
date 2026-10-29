import { View } from 'react-native';

export function IngredientListSkeleton() {
  return (
    <View accessibilityLabel="Loading ingredients" className="px-5 pt-4">
      {Array.from({ length: 6 }, (_, index) => (
        <View
          key={index}
          className={`mb-3 h-12 rounded-card border border-border ${
            index % 2 === 0 ? 'bg-card' : 'bg-neutral-offwhite'
          }`}
        />
      ))}
    </View>
  );
}
