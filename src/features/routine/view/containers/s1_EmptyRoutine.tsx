import { RoutineSkinProfile } from '../../model/routine_types';
import { RoutineDisclaimer } from '../components/RoutineDisclaimer';
import { RoutineGenerationCard } from '../components/RoutineGenerationCard';
import { RoutineSkinProfileCard } from '../components/RoutineSkinProfileCard';

interface EmptyRoutineProps {
  skinProfile: RoutineSkinProfile | null;
  isSkinProfileLoading: boolean;
  profileError: string | null;
  isGenerating: boolean;
  generationError: string | null;
  canGenerate: boolean;
  onRetryProfile: () => void;
  onStartScan: () => void;
  onGenerate: () => void;
  onDismissGenerationError: () => void;
}

export function S1EmptyRoutine({
  skinProfile,
  isSkinProfileLoading,
  profileError,
  isGenerating,
  generationError,
  canGenerate,
  onRetryProfile,
  onStartScan,
  onGenerate,
  onDismissGenerationError,
}: EmptyRoutineProps) {
  return (
    <>
      <RoutineSkinProfileCard
        profile={skinProfile}
        isLoading={isSkinProfileLoading}
        error={profileError}
        onRetry={onRetryProfile}
        onStartScan={onStartScan}
      />
      <RoutineGenerationCard
        isGenerating={isGenerating}
        error={generationError}
        canGenerate={canGenerate}
        onGenerate={onGenerate}
        onDismissError={onDismissGenerationError}
      />
      <RoutineDisclaimer />
    </>
  );
}