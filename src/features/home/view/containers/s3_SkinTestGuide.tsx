import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Info, X } from 'lucide-react-native';
import { theme } from '@/shared/theme';

export function S3SkinTestGuide() {
  const [modalVisible, setModalVisible] = useState(false);

  const steps = [
    'Cleanse your face thoroughly to remove dirt, excess sebum, and makeup.',
    'Stand in front of bright, even, natural indirect lighting; avoid backlighting.',
    'Keep a relaxed, neutral facial expression and pull hair back from your forehead.',
    'Hold your phone at eye level, roughly 12 to 18 inches away from your face.',
  ];

  return (
    <View className="mb-7">
      <View className="bg-background rounded-card p-4 border border-border shadow-xs overflow-visible relative">
        {/* Top Header: Info Icon + Title */}
        <View className="flex-row items-center mb-3">
          <View className="mr-2">
            <Info size={19} color={theme.colors.text} strokeWidth={2.2} />
          </View>
          <Text className="text-body font-sans-bold text-text">
            Skin Test Guide Tip
          </Text>
        </View>

        {/* Content Row: Description & CTA Button on right (pl-[92px] leaves room for book) */}
        <View className="flex-row items-center overflow-visible pl-[92px]">
          <View className="flex-1">
            <Text className="text-caption font-sans text-muted leading-4 mb-2.5">
              To ensure accurate and reliable skin analysis results, follow these steps before scanning your face!
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              className="bg-secondary py-2 px-3 rounded-button self-start shadow-xs"
            >
              <Text className="text-card text-caption font-sans-bold tracking-wide">
                STEPS BEFORE FACE SCAN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guide Graphic Book (home-img2.png) - hanging boldly outside bottom-left */}
        <Image
          source={require('@/assets/images/home-img2.png')}
          style={{
            position: 'absolute',
            left: -10,
            bottom: -16,
            width: 106,
            height: 116,
            zIndex: 20,
          }}
          resizeMode="contain"
        />
      </View>

      {/* Guide Steps Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-5">
          <View className="bg-card rounded-card p-6 w-full max-w-sm shadow-xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-border">
              <View className="flex-row items-center">
                <View className="p-1.5 rounded-full bg-secondary/20 mr-2.5">
                  <Info size={18} color={theme.colors.secondary} />
                </View>
                <Text className="text-h3 font-sans-bold text-text">
                  Scan Preparation
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-1 rounded-full bg-background"
              >
                <X size={18} color={theme.colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Steps List */}
            <View className="space-y-3 gap-3 mb-5">
              {steps.map((text, idx) => (
                <View key={idx} className="flex-row items-start">
                  <View className="w-5 h-5 rounded-full bg-primary items-center justify-center mr-2.5 mt-0.5">
                    <Text className="text-card text-caption font-sans-bold">
                      {idx + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-body-sm font-sans text-text leading-5">
                    {text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Got It Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
              className="bg-primary py-3 rounded-button items-center justify-center"
            >
              <Text className="text-card text-body-sm font-sans-bold tracking-wider">
                GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
