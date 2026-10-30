import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { theme } from '../theme';

export interface NoteProps {
  /** Note heading text */
  title: string;
  /** Body text string */
  description?: string;
  /** Optional custom React children for rich body content (e.g. bullet lists, links) */
  children?: ReactNode;
  /** Layout style: 1 = side-by-side two-column, 2 = stacked header with body below. Default: 1 */
  style?: 1 | 2;
  /** Optional Lucide icon override */
  icon?: LucideIcon;
  /** Additional Tailwind className for margin or positioning (e.g. 'mx-5 mb-3') */
  className?: string;
  /** Accessibility test ID */
  testID?: string;
}

export interface BaseNoteProps extends NoteProps {
  containerClass: string;
  borderClass: string;
  badgeClass: string;
}

export function BaseNote({
  title,
  description,
  children,
  style = 1,
  icon: IconComponent,
  containerClass,
  borderClass,
  badgeClass,
  className = '',
  testID,
}: BaseNoteProps) {
  const content = children || (
    description ? (
      <Text className="text-body-sm font-sans text-text leading-5">
        {description}
      </Text>
    ) : null
  );

  if (style === 2) {
    return (
      <View
        testID={testID}
        accessibilityRole="summary"
        className={`rounded-card border ${borderClass} ${containerClass} p-4 shadow-xs ${className}`}
      >
        {/* Row 1: [Col 1: Note Symbol] [Col 2: Note Title] */}
        <View className="flex-row items-center gap-2.5 mb-2">
          {IconComponent ? (
            <View
              className={`w-7 h-7 rounded-full items-center justify-center shrink-0 ${badgeClass}`}
            >
              <IconComponent size={15} color={theme.colors.white} strokeWidth={2.5} />
            </View>
          ) : null}
          <Text className="text-h3 font-sans-bold text-text flex-1">
            {title}
          </Text>
        </View>

        {/* Row 2: Full-width Body */}
        {content ? <View className="w-full">{content}</View> : null}
      </View>
    );
  }

  // Style 1 (Default): Col 1 Note Symbol, Col 2 [Row 1: Title, Row 2: Body]
  return (
    <View
      testID={testID}
      accessibilityRole="summary"
      className={`flex-row items-start gap-3.5 rounded-card border ${borderClass} ${containerClass} p-4 shadow-xs ${className}`}
    >
      {IconComponent ? (
        <View
          className={`w-10 h-10 rounded-full items-center justify-center shrink-0 ${badgeClass}`}
        >
          <IconComponent size={20} color={theme.colors.white} strokeWidth={2.2} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-body font-sans-bold text-text mb-1">
          {title}
        </Text>
        {content}
      </View>
    </View>
  );
}
