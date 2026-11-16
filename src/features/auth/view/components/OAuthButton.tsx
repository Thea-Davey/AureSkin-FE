import React from 'react';
import { Text } from 'react-native';
import { Button } from '@/shared/components/Button';

interface OAuthButtonProps {
  provider: 'Google' | 'Facebook';
  onPress: () => void;
  isLoading?: boolean;
}

export function OAuthButton({ provider, onPress, isLoading }: OAuthButtonProps) {
  const iconText = provider === 'Google' ? 'G' : 'f';
  const colorClass = provider === 'Google' ? 'text-status-error' : 'text-status-info';

  return (
    <Button
      variant="white"
      size="md"
      onPress={onPress}
      disabled={isLoading}
      isLoading={isLoading}
      accessibilityLabel={`Sign in with ${provider}`}
      className="flex-1 py-3 px-4 border border-neutral-border active:opacity-70 active:bg-neutral-offwhite"
    >
      <Text className={`font-sans-bold text-h3 ${colorClass}`}>
        {iconText}
      </Text>
    </Button>
  );
}
