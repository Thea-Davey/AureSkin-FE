import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseButton } from '../../../shared/components/CloseButton';
import { PositiveNote } from '../../../shared/components/PositiveNote';
import { theme } from '../../../shared/theme';
import { useProfile } from '../viewmodel/useProfile';
import { SkinOverviewCard } from './components/SkinOverviewCard';
import { ProfileInfoCard } from './components/ProfileInfoCard';

export default function ProfilePage() {
  const { profile, actions } = useProfile();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 24);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />

      {/* Top Olive Green Hero Header */}
      <View
        style={{ paddingTop: topInset + 8, paddingBottom: 20 }}
        className="px-5 relative z-20"
      >
        {/* Top-Right Close Button with Safe Area Spacing */}
        <CloseButton
          accessibilityLabel="Close profile"
          onPress={actions.closeProfile}
          style={{ top: topInset + 4 }}
          className="absolute right-5 z-30"
        />

        {/* User Info Block: Avatar overlapping boundary + Greeting + Edit Profile Button */}
        <View className="flex-row items-center gap-4 mt-8">
          {/* Avatar with cream/card border overlapping onto the curved outer container */}
          <View
            style={{ marginBottom: -32 }}
            className="z-30 shadow-md"
          >
            {profile.avatarUri ? (
              <Image
                source={{ uri: profile.avatarUri }}
                className="w-32 h-32 rounded-full border-4 border-offwhitebg bg-offwhitebg"
              />
            ) : (
              <View className="w-32 h-32 rounded-full border-4 border-card bg-card items-center justify-center">
                <Text className="text-display font-sans-bold text-primary">
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>

          {/* Greeting & Edit Profile Outer Container Wrapper */}
          <View className="flex-1 pb-1">
            <Text className="text-h1 font-sans-bold text-neutral-white">
              {profile.firstName || 'User'}
            </Text>

            {/* Outer container wrapper for Edit Profile button */}
            <View className="flex-row items-center mt-1">
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                className="rounded-full bg-white/25 border border-white/30 px-4 py-1.5 flex-row items-center justify-center"
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Edit Profile"
                  onPress={actions.openEditProfile}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="text-caption font-sans-medium text-neutral-white">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* OUTER BACKGROUND CONTAINER WITH CURVED TOP CORNERS */}
      <View
        style={{
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          overflow: 'hidden',
          backgroundColor: theme.colors.background,
          marginTop: -20
        }}
        className="flex-1 bg-background rounded-t-[32px] z-10"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 42, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Skin Overview */}
          <SkinOverviewCard
            skinType={profile.skinType}
            conditions={profile.skinConditions}
            healthScore={profile.healthScore}
          />

          {/* Card 2: Profile Information */}
          <ProfileInfoCard
            age={profile.age}
            allergens={profile.allergens}
            onEditPress={actions.openEditProfile}
          />

          {/* Callout: Your Information is Safe */}
          <PositiveNote
            style={1}
            title="Your Information is Safe"
            description="We protect your personal data and skin health records. Your information is encrypted and strictly used to personalize your skincare insights."
            className="mt-1"
          />
        </ScrollView>
      </View>
    </View>
  );
}
