import React from 'react';
import { View, Text } from 'react-native';
import { Mail, HelpCircle, ExternalLink } from 'lucide-react-native';
import { SupportChannel } from '../../model/help_types';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';

interface SupportCardProps {
  support: SupportChannel;
  onContactSupport: () => void;
}

export function SupportCard({ support, onContactSupport }: SupportCardProps) {
  return (
    <Card style={2} className="mb-4 bg-card p-5 items-stretch">
      <View className="mb-2.5 h-12 w-12 items-center justify-center rounded-full bg-primary/15 self-center">
        <Mail size={22} color={theme.colors.primary} />
      </View>

      <Text className="text-center text-body font-sans-bold text-text">
        Still Have Questions?
      </Text>
      <Text className="mt-1 text-center text-body-sm font-sans text-muted">
        Reach out to our engineering and capstone research team directly:
      </Text>

      <Button
        variant="primary"
        size="md"
        onPress={onContactSupport}
        accessibilityLabel="Email AureSkin support"
        className="mt-3.5 px-4 py-3"
      >
        <Mail size={18} color={theme.colors.card} />
        <Text className="ml-2 text-body font-sans-bold text-neutral-white">
          {support.email}
        </Text>
        <View className="ml-1.5 opacity-80">
          <ExternalLink size={14} color={theme.colors.card} />
        </View>
      </Button>

      <Text className="mt-2.5 text-center text-caption font-sans text-muted">
        Average response time: {support.responseTime}
      </Text>

      {/* Helpful Hint */}
      <View className="mt-3.5 flex-row items-start border-t border-border/50 pt-3">
        <View className="mr-2 mt-0.5">
          <HelpCircle size={15} color={theme.colors.muted} />
        </View>
        <Text className="flex-1 text-caption font-sans text-muted leading-4">
          {support.faqHint}
        </Text>
      </View>
    </Card>
  );
}

