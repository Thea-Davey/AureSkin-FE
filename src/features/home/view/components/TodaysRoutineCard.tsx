import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sun, MoonStar } from 'lucide-react-native';
import { RoutineStep } from '../../model/home_types';

export interface TodaysRoutineCardProps {
  styleType?: 'morning' | 'night';
  steps: RoutineStep[];
  onPressCard?: () => void;
}

/**
 * TodaysRoutineCard
 * Skincare routine card for the Home screen dashboard.
 * Style 1: Morning Routine (Beige header, filled Sun icon, dark text)
 * Style 2: Night Routine (Secondary dark header, filled MoonStar icon, white text)
 * Numbered circles positioned above a seamless, continuous connector line (zero gaps).
 * Compact single line per step: "product type • product name".
 */
export function TodaysRoutineCard({
  styleType = 'morning',
  steps,
  onPressCard,
}: TodaysRoutineCardProps) {
  const isMorning = styleType === 'morning';

  return (
    <TouchableOpacity
      activeOpacity={onPressCard ? 0.85 : 1}
      onPress={onPressCard}
      className="bg-card rounded-card overflow-hidden shadow-xs"
    >
      {/* Header Banner (Sun / MoonStar + Routine Title, subtitle removed) */}
      <View
        className={`px-4 py-3.5 flex-row items-center justify-between ${isMorning ? 'bg-neutral-beige' : 'bg-secondary-dark'
          }`}
      >
        <View className="flex-row items-center flex-1">
          {isMorning ? (
            <Sun
              size={22}
              color="#F59E0B"
              fill="#F59E0B"
              strokeWidth={2}
            />
          ) : (
            <MoonStar
              size={22}
              color="#0055D4"
              fill="#0055D4"
              strokeWidth={2}
            />
          )}
          <Text
            className={`ml-2.5 text-small font-sans-bold ${isMorning ? 'text-text' : 'text-neutral-white'
              }`}
          >
            {isMorning ? 'Morning Routine' : 'Night Routine'}
          </Text>
        </View>
      </View>

      {/* Ordered Step List with Seamless Numbered Circles & Connector Lines */}
      <View className="px-5 pt-4 pb-3">
        {steps.length === 0 ? (
          <View className="py-2 items-center justify-center">
            <Text className="text-body-sm font-sans text-muted text-center">
              No routine steps saved yet.
            </Text>
          </View>
        ) : (
          steps.map((step, index) => {
            const stepNum = step.step_number || index + 1;
            const typeLabel = step.category || step.title;
            const productLabel = step.product_name;
            const isLast = index === steps.length - 1;

            return (
              <View
                key={step.id || step.step_number || index}
                className="flex-row items-stretch"
              >
                {/* Left: Numbered Badge with Line Underneath (Zero Gaps) */}
                <View className="w-6 items-center justify-start relative mr-3.5 shrink-0">
                  {/* Top connector line entering from previous step */}
                  {index > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        height: 12,
                        width: 2,
                        backgroundColor: 'rgba(107, 123, 76, 0.25)',
                      }}
                    />
                  )}

                  {/* Bottom connector line exiting to next step */}
                  {!isLast && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 12,
                        bottom: 0,
                        width: 2,
                        backgroundColor: 'rgba(107, 123, 76, 0.25)',
                      }}
                    />
                  )}

                  {/* Numbered Circle placed above the line with solid card backdrop */}
                  <View
                    style={{ zIndex: 10 }}
                    className="w-6 h-6 rounded-full bg-card items-center justify-center"
                  >
                    <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                      <Text className="text-caption font-sans-bold text-primary">
                        {stepNum}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right: Product Type & Product Name below */}
                <View className={`flex-1 justify-start pt-0 ${!isLast ? 'pb-3.5' : 'pb-1'}`}>
                  <Text
                    className="text-body-sm font-sans-bold text-text leading-5"
                    numberOfLines={1}
                  >
                    {typeLabel}
                  </Text>
                  {productLabel ? (
                    <Text
                      className="text-caption font-sans text-muted leading-4 mt-0.5"
                      numberOfLines={1}
                    >
                      {productLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </TouchableOpacity>
  );
}

export default TodaysRoutineCard;
