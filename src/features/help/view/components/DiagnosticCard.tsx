import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Trash2, CheckCircle2 } from 'lucide-react-native';
import { DiagnosticItem } from '../../model/help_types';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { theme } from '@/shared/theme';

interface DiagnosticCardProps {
  diagnostics: DiagnosticItem[];
  isClearing: boolean;
  clearedStatus: string | null;
  onClearCache: () => void;
}

export function DiagnosticCard({
  diagnostics,
  isClearing,
  clearedStatus,
  onClearCache,
}: DiagnosticCardProps) {
  return (
    <Card style={2} className="mb-4 bg-card p-5 items-stretch">
      <View className="mb-3.5 flex-row items-center">
        <Activity size={20} color={theme.colors.primary} />
        <Text className="ml-2 text-h3 font-sans-bold text-text">
          Diagnostics & Storage
        </Text>
      </View>

      {/* Diagnostic System Items */}
      <View className="gap-2.5">
        {diagnostics.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center justify-between rounded-card border border-border/60 bg-neutral-card/50 px-3.5 py-2.5"
          >
            <View className="flex-row items-center">
              <View className="mr-2.5 h-2.5 w-2.5 rounded-full bg-status-success" />
              <Text className="text-body-sm font-sans-medium text-text">
                {item.label}
              </Text>
            </View>
            <Text className="text-caption font-sans-semibold text-primary">
              Ready
            </Text>
          </View>
        ))}
      </View>

      {/* Divider */}
      <View className="my-3.5 border-b border-border/50" />

      {/* Photo Cache Purge Action */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-body-sm font-sans-semibold text-text">
            Temporary Photo Cache
          </Text>
          <Text className="mt-0.5 text-caption font-sans text-muted">
            Frees up on-device scan preview files without affecting saved history.
          </Text>
        </View>

        <Button
          variant="outline"
          size="sm"
          title="Clear Cache"
          onPress={onClearCache}
          disabled={isClearing}
          isLoading={isClearing}
          accessibilityLabel="Clear temporary cache"
          leftIcon={<Trash2 size={15} color={theme.colors.text} />}
          className="px-3.5 py-2 border-border bg-neutral-card"
          textClassName="ml-1.5 text-caption font-sans-semibold text-text"
        />
      </View>

      {clearedStatus && (
        <View className="mt-2.5 flex-row items-center rounded-button bg-status-success/15 px-3 py-1.5">
          <CheckCircle2 size={14} color={theme.colors.status.success} />
          <Text className="ml-1.5 text-caption font-sans-medium text-text">
            {clearedStatus}
          </Text>
        </View>
      )}
    </Card>
  );
}

