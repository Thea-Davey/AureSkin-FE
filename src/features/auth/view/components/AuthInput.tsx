import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useState } from 'react';

interface AuthInputProps extends TextInputProps {
  error?: boolean;
  errorMessage?: string;
}

export function AuthInput({ error, errorMessage, ...props }: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4 w-full">
      <TextInput
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#B0B0B0"
        className={`
          w-full bg-neutral-white border-2 rounded-input px-4 py-3 font-body text-neutral-text
          ${error 
            ? 'border-status-error' 
            : isFocused 
              ? 'border-primary' 
              : 'border-neutral-border'
          }
        `}
      />
      {error && errorMessage && (
        <Text className="text-status-error text-caption mt-1 ml-1 font-sans-medium">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
