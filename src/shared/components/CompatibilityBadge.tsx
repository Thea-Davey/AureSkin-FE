import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { theme } from '../theme';

export type CompatibilityStatus =
  | 'compatible'
  | 'incompatible'
  | 'not_listed'
  | 'scan_needed'
  | 'unavailable'
  | 'review'
  | string;

export interface CompatibilityBadgeProps {
  status: CompatibilityStatus;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
  label?: string;
  showScanNeeded?: boolean;
}

/**
 * CompatibilityBadge
 * Shared AureSkin status badge indicating ingredient/product compatibility with
 * the user's latest facial skin profile.
 *
 * Supported modes:
 * - standard (default): green pill with BadgeCheck icon + "Compatible" label
 * - compact: small 24x24 circular badge containing BadgeCheck icon
 * - loading: subtle checking indicator (shown if isLoading=true)
 * - unverified/scan_needed: muted badge if showScanNeeded=true
 */
export function CompatibilityBadge({
  status,
  isLoading = false,
  compact = false,
  className = '',
  showIcon = true,
  label = 'Compatible',
  showScanNeeded = false,
}: CompatibilityBadgeProps) {
  if (isLoading) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Checking compatibility"
        className={`flex-row items-center gap-1.5 rounded-badge bg-background px-2.5 py-1.5 ${className}`}
      >
        <ActivityIndicator size="small" color={theme.colors.muted} />
        <Text className="text-caption font-sans-medium text-muted">Checking</Text>
      </View>
    );
  }

  if (status === 'compatible') {
    if (compact) {
      return (
        <View
          accessibilityRole="text"
          accessibilityLabel="Compatible with your latest skin analysis"
          className={`h-6 w-6 items-center justify-center rounded-full bg-status-success ${className}`}
        >
          <BadgeCheck size={14} color={theme.colors.white} strokeWidth={2.2} />
        </View>
      );
    }

    return (
      <View
        accessibilityRole="text"
        accessibilityLabel="Compatible with your latest skin analysis"
        className={`flex-row items-center gap-1 rounded-badge bg-status-success px-2.5 py-1.5 ${className}`}
      >
        {showIcon ? (
          <BadgeCheck size={14} color={theme.colors.white} strokeWidth={2.2} />
        ) : null}
        <Text className="text-caption font-sans-semibold text-neutral-white">
          {label}
        </Text>
      </View>
    );
  }

  if (showScanNeeded && (status === 'scan_needed' || status === 'review' || status === 'not_listed')) {
    const unverifiedLabel = status === 'scan_needed' ? 'Scan needed' : 'Not verified';
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={unverifiedLabel}
        className={`rounded-badge bg-background px-3 py-2 ${className}`}
      >
        <Text className="text-caption font-sans-medium text-muted">{unverifiedLabel}</Text>
      </View>
    );
  }

  return null;
}

export default CompatibilityBadge;
