import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';
import { useAppStore } from '../store/appStore';
import { theme } from '../theme';

export type AppHeaderFontSize =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'label'
  | string;

export interface AppHeaderProps {
  /** Title text displayed in the header */
  title: string;
  /**
   * Font size preset for the header title text.
   * Uses AureSkin design token presets: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'body-sm' | 'caption' | 'label'
   * Defaults to 'h2' (22px / 30px) as per design specification.
   */
  titleSize?: AppHeaderFontSize;
  /**
   * Additional or override Tailwind class names for the title (e.g. font weight, color, or specific size)
   */
  titleClassName?: string;
  /**
   * Optional subtitle text displayed below the title
   */
  subtitle?: string;
  /**
   * Optional font size or styling for the subtitle (defaults to 'text-body-sm font-sans text-neutral-white/80')
   */
  subtitleClassName?: string;
  /**
   * Optional right accessory component (e.g. notifications, action button)
   */
  rightElement?: React.ReactNode;
  /**
   * Optional container styling override
   */
  className?: string;
}

/** Global default font size for AppHeader title across all tabs */
export const DEFAULT_HEADER_TITLE_SIZE: AppHeaderFontSize = 'h2';

function resolveTitleSizeClass(size?: AppHeaderFontSize): string {
  const targetSize = size || DEFAULT_HEADER_TITLE_SIZE;
  if (targetSize.startsWith('text-')) return targetSize;

  switch (targetSize) {
    case 'display':
      return 'text-display';
    case 'h1':
      return 'text-h1';
    case 'h2':
      return 'text-h2';
    case 'h3':
      return 'text-h3';
    case 'body':
      return 'text-body';
    case 'body-sm':
      return 'text-body-sm';
    case 'caption':
      return 'text-caption';
    case 'label':
      return 'text-label';
    default:
      return 'text-h2';
  }
}

export function AppHeader({
  title,
  titleSize = DEFAULT_HEADER_TITLE_SIZE,
  titleClassName = '',
  subtitle,
  subtitleClassName = '',
  rightElement,
  className = '',
}: AppHeaderProps) {
  const openMenu = useAppStore((state) => state.openMenu);

  const hasCustomSizeInClassName = /\btext-(display|h[1-3]|body|body-sm|caption|label)\b/.test(
    titleClassName
  );
  const sizeClass = hasCustomSizeInClassName ? '' : resolveTitleSizeClass(titleSize);
  const titleClasses = `${sizeClass} font-sans-bold text-neutral-white ${titleClassName}`.trim();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
      <View className={`flex-row items-center px-5 py-2 mb-2 mt-1 bg-primary ${className}`}>
        <TouchableOpacity
          onPress={openMenu}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          className="mr-4"
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
        >
          <Menu size={24} color={theme.colors.card} />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <Text numberOfLines={1} className={titleClasses}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className={`text-body-sm font-sans text-neutral-white/80 mt-0.5 ${subtitleClassName}`.trim()}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightElement ? <View className="ml-3 shrink-0">{rightElement}</View> : null}
      </View>
    </SafeAreaView>
  );
}

export default AppHeader;
