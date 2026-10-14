import { Pressable, Text } from 'react-native';
// Assuming lucide-react-native doesn't have standard G/F logos, you might use text or custom SVGs.
// For now, using text as placeholders based on Figma designs.

interface OAuthButtonProps {
  provider: 'Google' | 'Facebook';
  onPress: () => void;
  isLoading?: boolean;
}

export function OAuthButton({ provider, onPress, isLoading }: OAuthButtonProps) {
  const iconText = provider === 'Google' ? 'G' : 'f';
  const colorClass = provider === 'Google' ? 'text-status-error' : 'text-status-info'; // Rough approximation of brand colors

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className={`
        flex-1 py-3 px-4 rounded-button border border-neutral-border items-center justify-center bg-neutral-white
        active:opacity-70 active:bg-neutral-offwhite
      `}
    >
      <Text className={`font-sans-bold text-h3 ${colorClass}`}>
        {iconText}
      </Text>
    </Pressable>
  );
}
