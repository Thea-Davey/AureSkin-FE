import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '../theme';

export interface SearchBarProps {
  /** Layout style: 1 = simple search input, 2 = search input with embedded filter pill on right. Default: 1 */
  style?: 1 | 2;
  /** Search text input value */
  value: string;
  /** Callback fired when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Category/filter label displayed inside the pill button for Style 2 (defaults to 'All') */
  filterLabel?: string;
  /** Callback fired when filter pill is pressed (Style 2) */
  onFilterPress?: () => void;
  /** Additional container styling */
  className?: string;
  /** Test identifier */
  testID?: string;
}

export function SearchBar({
  style = 1,
  value,
  onChangeText,
  placeholder = 'search ingredients',
  filterLabel = 'All',
  onFilterPress,
  className = '',
  testID,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // When custom padding, background, or rounded corners are specified, omit conflicting default classes
  const hasCustomPadding =
    className.includes('px-') ||
    className.includes('p-') ||
    className.includes('pl-') ||
    className.includes('pr-');

  const hasCustomBackground = className.includes('bg-');
  const hasCustomRounded = className.includes('rounded-');

  const containerClasses = [
    hasCustomRounded ? '' : 'rounded-t-card',
    hasCustomBackground ? '' : 'bg-card',
    hasCustomPadding ? '' : 'px-5 pb-2 pt-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View
      testID={testID}
      className={containerClasses}
      style={hasCustomPadding && className.includes('px-0') ? { paddingHorizontal: 0 } : undefined}
    >
      <View
        className={`flex-row items-center rounded-full border bg-card pl-4 ${
          style === 2 ? 'pr-1.5' : 'pr-4'
        } ${isFocused ? 'border-primary' : 'border-border'}`}
      >
        <Search size={20} color={isFocused ? theme.colors.primary : theme.colors.muted} />
        <TextInput
          accessibilityLabel={placeholder}
          accessibilityHint="Filters items by search query"
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

        {style === 2 && onFilterPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Filter: ${filterLabel}`}
            accessibilityHint="Opens category filter options"
            onPress={onFilterPress}
            className="ml-2 rounded-full bg-secondary/20 px-4 py-2 active:opacity-70"
          >
            <Text className="text-caption font-sans-medium text-text">
              {filterLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
