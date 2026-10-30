import React from 'react';
import { Check, ShieldCheck } from 'lucide-react-native';
import { BaseNote, NoteProps } from './BaseNote';

export function PositiveNote({
  style = 1,
  icon,
  ...props
}: NoteProps) {
  const DefaultIcon = style === 2 ? Check : ShieldCheck;

  return (
    <BaseNote
      style={style}
      icon={icon || DefaultIcon}
      containerClass="bg-note-positive"
      borderClass="border-note-positive-border"
      badgeClass="bg-note-positive-element"
      {...props}
    />
  );
}
