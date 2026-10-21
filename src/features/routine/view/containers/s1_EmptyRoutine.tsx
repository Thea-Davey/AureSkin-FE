import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { RoutineSkinProfile } from '../../model/routine_types';
import { GenerateRoutineCard } from '../components/GenerateRoutineCard';
import { RoutineDisclaimer } from '../components/RoutineDisclaimer';
import { SkinProfileCard } from '../components/SkinProfileCard';

interface S1EmptyRoutineProps {
  profile: RoutineSkinProfile | null;
  isGenerating: boolean;
  errorMessage: string | null;
  onGenerate: () => void;
  onScanPress: () => void;
}

export function S1EmptyRoutine({
  profile,
  isGenerating,
  errorMessage,
  onGenerate,
  onScanPress,
}: S1EmptyRoutineProps) {
  const entrances = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.stagger(
      100,
      entrances.map((entrance) =>
        Animated.timing(entrance, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [entrances]);

  const cardStyle = (entrance: Animated.Value) => ({
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  });

  return (
    <View className="gap-4 px-4 pb-8 pt-4">
      <Animated.View style={cardStyle(entrances[0])}>
        <SkinProfileCard profile={profile} />
      </Animated.View>
      <Animated.View style={cardStyle(entrances[1])}>
        <GenerateRoutineCard
          canGenerate={Boolean(profile)}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          onGenerate={onGenerate}
          onScanPress={onScanPress}
        />
      </Animated.View>
      <Animated.View style={cardStyle(entrances[2])}>
        <RoutineDisclaimer />
      </Animated.View>
    </View>
  );
}