import { Pressable, Text, ActivityIndicator } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AuthButton({ title, onPress, isLoading, disabled }: AuthButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading || disabled}
      className={`
        w-full py-4 rounded-button items-center justify-center mt-2
        ${disabled || isLoading ? 'bg-secondary-light opacity-70' : 'bg-secondary active:bg-secondary-dark'}
      `}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-neutral-white font-sans-semibold text-body">
          {title}
        </Text>
      )}
    </Pressable>
  );
}
