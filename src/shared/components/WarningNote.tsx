import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react-native';
import { BaseNote, NoteProps } from './BaseNote';

export function WarningNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  const DefaultIcon = style === 2 ? AlertTriangle : ShieldAlert;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-warning"
      borderClass="border-note-warning-border"
      badgeClass="bg-note-warning-element"
      {...props}
    />
  );
}
