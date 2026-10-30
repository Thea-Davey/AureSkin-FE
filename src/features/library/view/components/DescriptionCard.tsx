import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export type BulletTone = 'positive' | 'negative' | 'ingredient';

export interface DescriptionCardProps {
  /** Section heading title (e.g. "What is it?", "What does it do?") */
  title: string;
  /** Card presentation style: 'description' (paragraph) or 'bulleted' (list). Default: 'description' */
  variant?: 'description' | 'bulleted';
  /** Paragraph text for 'description' variant */
  description?: string | null;
  /** List items for 'bulleted' variant */
  bullets?: string[];
  /** Bullet symbol tone: 'positive' (green dot), 'negative' (red dot), 'ingredient' (droplet icon). Default: 'positive' */
  bulletTone?: BulletTone;
  /** Optional extra content (e.g. caution disclaimer or subtext) */
  children?: ReactNode;
  /** Additional outer container classes */
  className?: string;
}

export function DescriptionCard({
  title,
  variant = 'description',
  description,
  bullets = [],
  bulletTone = 'positive',
  children,
  className = '',
}: DescriptionCardProps) {
  const renderBulletSymbol = () => {
    switch (bulletTone) {
      case 'ingredient':
        return (
          <View className="mt-0.5 shrink-0">
            <Droplet size={13} color={theme.colors.secondary} fill={theme.colors.secondary} />
          </View>
        );
      case 'negative':
        return <View className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-status-error" />;
      case 'positive':
      default:
        return <View className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />;
    }
  };

  return (
    <View className={`mb-3 rounded-card border border-border bg-card p-4 shadow-xs ${className}`}>
      {/* Category Card Title: Styled with text-body-sm font-sans-bold text-muted for clean hierarchy */}
      <Text className="mb-2 text-body-sm font-sans-bold text-secondary-dark">   {/* text-secondary-dark change: secondary-dark to primary, muted, accent*/}
        {title}
      </Text>

      {/* Description Variant: Narrative Text */}
      {variant === 'description' && description?.trim() ? (
        <Text className="text-body-sm font-sans text-text leading-5">
          {description}
        </Text>
      ) : null}

      {/* Bulleted Variant: List of Items with Dynamic Dot */}
      {variant === 'bulleted' && bullets.length > 0 ? (
        <View className="gap-2">
          {bullets.map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row items-start gap-2.5">
              {renderBulletSymbol()}
              <Text className="flex-1 text-body-sm font-sans text-text leading-5">
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Extra Children (e.g. Caution notes, custom paragraphs) */}
      {children}
    </View>
  );
}
