import React from 'react';
import { AlertCircle, X } from 'lucide-react-native';
import { BaseNote, NoteProps } from './BaseNote';

export function NegativeNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  const DefaultIcon = style === 2 ? X : AlertCircle;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-negative"
      borderClass="border-note-negative-border"
      badgeClass="bg-note-negative-element"
      {...props}
    />
  );
}
