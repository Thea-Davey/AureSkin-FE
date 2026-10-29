import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';
import { PipelineStageInfo } from '../../../model/scan_types';

interface S2AnalyzingStatusProps {
  stage: PipelineStageInfo;
}

/**
 * Container Section 2: Pipeline Stage Status.
 * Dynamically renders the active pipeline stage headline in bold uppercase green
 * and its explanatory subtext with smooth crossfade and slide-up animations.
 */
export const S2AnalyzingStatus: React.FC<S2AnalyzingStatusProps> = ({
  stage,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  // Crossfade and subtle slide-up animation on stage transition
  useEffect(() => {
    fadeAnim.setValue(0.2);
    slideAnim.setValue(6);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stage.key, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="items-center justify-center px-6 min-h-[90px]"
    >
      {/* Active Pipeline Stage Headline */}
      <Text
        className="text-status-success font-sans-bold text-body tracking-wider text-center uppercase"
        accessibilityLiveRegion="polite"
      >
        {stage.headline}
      </Text>

      {/* Stage Explanatory Subtext */}
      <Text className="text-neutral-offwhite font-sans text-body-sm text-center mt-1.5">
        {stage.subtext}
      </Text>
    </Animated.View>
  );
};
