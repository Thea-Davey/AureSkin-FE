import React from 'react';
import { PositiveNote } from '@/shared/components';

interface WhyThisRoutineNoteProps {
  rationale?: string | null;
}

export function WhyThisRoutineNote({ rationale }: WhyThisRoutineNoteProps) {
  const noteBody = rationale ||
    'This routine is designed to address your acne & texture concerns while maintaining healthy and balanced skin.';

  return (
    <PositiveNote
      style={2}
      title="Why this routine?"
      description={noteBody}
    />
  );
}

