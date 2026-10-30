import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'search ingredients',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="rounded-t-card bg-card px-5 pb-2 pt-4">
      <View
        className={`flex-row items-center rounded-full border bg-card px-4 ${
          isFocused ? 'border-primary' : 'border-border'
        }`}
      >
        <Search size={20} color={isFocused ? theme.colors.primary : theme.colors.muted} />
        <TextInput
          accessibilityLabel="Search ingredients"
          accessibilityHint="Filters the ingredient list by name"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          className="ml-3 flex-1 py-2.5 text-body-sm font-sans text-text"
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            onPress={() => onChangeText('')}
            hitSlop={8}
            className="p-1 active:opacity-70"
          >
            <X size={18} color={theme.colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
