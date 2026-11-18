import React from 'react';
import { Image, ImageSourcePropType, View, Text, Pressable } from 'react-native';
import { Scan } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components/Card';
import { ShotType } from '../../model/scan_types';

const LEFT_FACE_ICON: ImageSourcePropType = require('../../../../../assets/images/left-face.png');
const FRONT_FACE_ICON: ImageSourcePropType = require('../../../../../assets/images/front-face.png');
const RIGHT_FACE_ICON: ImageSourcePropType = require('../../../../../assets/images/right-face.png');

export interface ShotTypeCardProps {
  selectedType: ShotType | null;
  onSelectType: (type: ShotType | null) => void;
}

/**
 * ShotTypeCard Component (Section 4.0 / Set Up Your Skin Analysis)
 * Row 1: Label
 * Row 2: Selectable inner containers: Single Shot vs. Triple Shot (toggleable)
 * Row 3: Dynamic footer note (Quick facial scan vs. Broader facial coverage)
 */
export const ShotTypeCard: React.FC<ShotTypeCardProps> = ({
  selectedType,
  onSelectType,
}) => {
  const isSingle = selectedType === 'single';
  const isTriple = selectedType === 'triple';

  return (
    <Card className="p-4 bg-card mb-3">
      {/* Row 1: Label */}
      <Text className="text-caption font-sans-medium text-muted mb-2">
        Shot Type
      </Text>

      {/* Row 2: Inner Option Containers */}
      <View className="flex-row items-stretch gap-3">
        {/* Col 1: Single Shot */}
        <Pressable
          onPress={() => onSelectType(isSingle ? null : 'single')}
          accessibilityRole="button"
          accessibilityLabel="Select Single Shot"
          accessibilityState={{ selected: isSingle }}
          className={`flex-1 rounded-card p-4 items-center justify-center border active:opacity-90 ${isSingle
            ? 'bg-secondary border-secondary'
            : 'bg-neutral-offwhite border-border'
            }`}
        >
          <View className="h-11 items-center justify-center">
            <Image
              source={FRONT_FACE_ICON}
              style={{
                width: 48,
                height: 48,
                tintColor: isSingle ? theme.colors.card : undefined,
              }}
              resizeMode="contain"
            />
          </View>
          <Text
            className={`mt-2 text-body-sm font-sans-bold ${isSingle ? 'text-neutral-white' : 'text-text'
              }`}
          >
            Single Shot
          </Text>
          <Text
            className={`mt-0.5 text-caption font-sans text-center ${isSingle ? 'text-neutral-white/90' : 'text-muted'
              }`}
          >
            Take 1 frontal selfie
          </Text>
        </Pressable>

        {/* Col 2: Triple Shot */}
        <Pressable
          onPress={() => onSelectType(isTriple ? null : 'triple')}
          accessibilityRole="button"
          accessibilityLabel="Select Triple Shot"
          accessibilityState={{ selected: isTriple }}
          className={`flex-1 rounded-card p-4 items-center justify-center border active:opacity-90 ${isTriple
            ? 'bg-secondary border-secondary'
            : 'bg-neutral-offwhite border-border'
            }`}
        >
          <View className="h-11 flex-row items-center justify-center gap-0">
            <Image
              source={LEFT_FACE_ICON}
              style={{
                width: 36,
                height: 36,
                tintColor: isTriple ? theme.colors.card : undefined,
              }}
              resizeMode="contain"
            />
            <Image
              source={FRONT_FACE_ICON}
              style={{
                width: 36,
                height: 36,
                tintColor: isTriple ? theme.colors.card : undefined,
              }}
              resizeMode="contain"
            />
            <Image
              source={RIGHT_FACE_ICON}
              style={{
                width: 36,
                height: 36,
                tintColor: isTriple ? theme.colors.card : undefined,
              }}
              resizeMode="contain"
            />
          </View>
          <Text
            className={`mt-2 text-body-sm font-sans-bold ${isTriple ? 'text-neutral-white' : 'text-text'
              }`}
          >
            Triple Shot
          </Text>
          <Text
            className={`mt-0.5 text-caption font-sans text-center ${isTriple ? 'text-neutral-white/90' : 'text-muted'
              }`}
          >
            Take 3 selfies: front, left, and right
          </Text>
        </Pressable>
      </View>

      {/* Row 3: Dynamic Footer Note (Hidden when unselected) */}
      {selectedType !== null && (
        <View className="mt-4 flex-row items-start gap-2 pt-3 border-t border-border">
          <View className="mt-0.5">
            <Scan size={16} color={theme.colors.muted} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-caption font-sans-semibold text-muted">
              {isSingle ? 'Quick facial scan' : 'Broader facial coverage'}
            </Text>
            <Text className="text-caption font-sans text-muted">
              {isSingle
                ? 'Ideal for skin type analysis using a single frontal photo.'
                : 'Captures additional facial areas for a more detailed assessment of visible skin conditions.'}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

export default ShotTypeCard;

