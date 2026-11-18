import React from 'react';
import { View, Text, Alert, Linking } from 'react-native';
import { Mail, HelpCircle, ExternalLink } from 'lucide-react-native';
import { SupportChannel, SupportContact } from '../../model/help_types';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';

interface SupportCardProps {
  support: SupportChannel;
  onContactSupport?: (email?: string, name?: string) => void;
}

const DEFAULT_CONTACTS: SupportContact[] = [
  {
    name: 'Althea Davey',
    email: 'dab0394@dlsud.edu.ph',
  },
  {
    name: 'Bea Barnachea',
    email: 'bbb0094@dlsud.edu.ph',
  },
  {
    name: 'Faith Rojales',
    email: 'rfp0721@dlsud.edu.ph',
  },
];

export function SupportCard({ support, onContactSupport }: SupportCardProps) {
  const contacts = support.contacts && support.contacts.length > 0
    ? support.contacts
    : DEFAULT_CONTACTS;

  const handleEmailPress = async (contact: SupportContact) => {
    if (onContactSupport) {
      onContactSupport(contact.email, contact.name);
      return;
    }

    const url = `mailto:${contact.email}?subject=AureSkin%20Support%20Request`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Email Support', `Please contact ${contact.name} at:\n${contact.email}`);
      }
    } catch {
      Alert.alert('Email Support', `Please contact ${contact.name} at:\n${contact.email}`);
    }
  };

  return (
    <Card style={2} className="mb-4 bg-card p-5 items-stretch">
      <View className="mb-2.5 h-12 w-12 items-center justify-center rounded-full bg-primary/15 self-center">
        <Mail size={22} color={theme.colors.primary} />
      </View>

      <Text className="text-center text-body font-sans-bold text-text">
        Still Have Questions?
      </Text>
      <Text className="mt-1 text-center text-body-sm font-sans text-muted mb-2">
        Reach out to our engineering and capstone research team directly:
      </Text>

      {/* 3 Contact Email Buttons with Names Above */}
      <View className="gap-3 my-1">
        {contacts.map((contact) => (
          <View key={contact.email} className="items-stretch">
            <Text className="text-center text-body-sm font-sans-bold text-text mb-1 px-0.5">
              {contact.name}
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => handleEmailPress(contact)}
              accessibilityLabel={`Email ${contact.name} at ${contact.email}`}
              className="px-4 py-3"
            >
              <Mail size={18} color={theme.colors.card} />
              <Text className="ml-2 text-body-sm font-sans-bold text-neutral-white">
                {contact.email}
              </Text>
              <View className="ml-1.5 opacity-80">
                <ExternalLink size={14} color={theme.colors.card} />
              </View>
            </Button>
          </View>
        ))}
      </View>

      <Text className="mt-3 text-center text-caption font-sans text-muted">
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

