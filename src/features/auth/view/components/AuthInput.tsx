import { TextInput, TextInputProps, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '@/shared/theme';

interface AuthInputProps extends TextInputProps {
  error?: boolean;
  errorMessage?: string;
  isPassword?: boolean;
}

export function AuthInput({ error, errorMessage, isPassword, secureTextEntry, ...props }: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ?? secureTextEntry;

  return (
    <View className="mb-4 w-full">
      <View
        className={`
          flex-row items-center w-full bg-neutral-white border-2 rounded-input px-4
          ${error 
            ? 'border-status-error' 
            : isFocused 
              ? 'border-primary' 
              : 'border-neutral-border'
          }
        `}
      >
        <TextInput
          {...props}
          secureTextEntry={isSecure ? !showPassword : false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.muted}
          className="flex-1 py-3 text-body font-sans text-neutral-text"
        />
        {isSecure && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.6}
            className="p-1"
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.muted} />
            ) : (
              <Eye size={20} color={theme.colors.muted} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && errorMessage && (
        <Text className="text-status-error text-caption mt-1 ml-1 font-sans-medium">
          {errorMessage}
        </Text>
      )}
    </View>
  );
}
