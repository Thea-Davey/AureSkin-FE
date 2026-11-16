import React from 'react';
import { Button } from '@/shared/components/Button';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AuthButton({ title, onPress, isLoading, disabled }: AuthButtonProps) {
  return (
    <Button
      variant="secondary"
      size="lg"
      fullWidth
      title={title}
      onPress={onPress}
      isLoading={isLoading}
      disabled={disabled}
      className="py-4 mt-2"
      textClassName="text-neutral-white font-sans-semibold text-body"
    />
  );
}
