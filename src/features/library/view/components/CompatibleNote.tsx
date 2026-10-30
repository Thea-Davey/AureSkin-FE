import React from 'react';
import { BadgeCheck } from 'lucide-react-native';
import { PositiveNote } from '@/shared/components';

interface CompatibleNoteProps {
  /** Optional custom body override; defaults to Option A text */
  description?: string;
  /** Explicit style override (1 = side-by-side, 2 = stacked header); auto-detected if omitted */
  style?: 1 | 2;
  /** Additional container classes */
  className?: string;
}

const DEFAULT_COMPATIBLE_TEXT =
  'Compatible with your latest skin analysis. This status may update whenever you rescan your skin.';

export function CompatibleNote({
  description = DEFAULT_COMPATIBLE_TEXT,
  style,
  className = '',
}: CompatibleNoteProps) {
  // Option A fits within 2 lines, so Style 2 is the default; if longer than ~110 chars, fall back to Style 1
  const effectiveStyle: 1 | 2 = style ?? (description.length > 110 ? 1 : 2);

  return (
    <PositiveNote
      style={effectiveStyle}
      icon={BadgeCheck}
      title="Compatible"
      description={description}
      className={`mb-4 ${className}`}
      testID="compatible-ingredient-note"
    />
  );
}
