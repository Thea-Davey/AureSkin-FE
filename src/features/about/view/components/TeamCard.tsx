import React from 'react';
import { View, Text } from 'react-native';
import { Code2, Microscope } from 'lucide-react-native';
import { TeamMember } from '../../model/about_types';
import { theme } from '../../../../shared/theme';

interface TeamCardProps {
  member: TeamMember;
}

export function TeamCard({ member }: TeamCardProps) {
  const isDev = member.isDeveloper;

  return (
    <View className="mb-3.5 rounded-card border border-border/70 bg-neutral-card/60 p-3.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${
              isDev ? 'bg-primary/20' : 'bg-secondary/20'
            }`}
          >
            {isDev ? (
              <Code2 size={15} color={theme.colors.primary} />
            ) : (
              <Microscope size={15} color={theme.colors.secondary} />
            )}
          </View>
          <Text className="text-body font-sans-bold text-text">
            {member.name}
          </Text>
        </View>

        <View
          className={`rounded-badge px-2.5 py-0.5 ${
            isDev ? 'bg-primary/15' : 'bg-secondary/15'
          }`}
        >
          <Text
            className={`text-caption font-sans-bold ${
              isDev ? 'text-primary' : 'text-secondary'
            }`}
          >
            {isDev ? 'DEVELOPER' : 'RESEARCHER'}
          </Text>
        </View>
      </View>

      <Text className="mt-2 text-body-sm font-sans-semibold text-text">
        {member.role}
      </Text>
      <Text className="mt-0.5 text-caption font-sans text-muted leading-4">
        {member.subRole}
      </Text>
    </View>
  );
}

