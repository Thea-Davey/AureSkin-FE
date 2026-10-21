import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { User, Heart, AlertCircle, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react-native';
import { ModalHeader } from '../../../shared/components/ModalHeader';
import { useAuthStore } from '../../../shared/store/authStore';
import { theme } from '../../../shared/theme';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Skincare User';

  const email = user?.email || 'user@example.com';

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Profile" />

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View className="bg-card rounded-card border border-border p-5 mb-5 items-center shadow-sm">
          <Image
            source={{ uri: avatarUrl }}
            className="w-24 h-24 rounded-full border-2 border-primary mb-3 bg-neutral-border"
          />
          <Text className="text-h2 font-sans-bold text-text text-center">
            {displayName}
          </Text>
          <Text className="text-body-sm font-sans text-muted text-center mt-0.5 mb-4">
            {email}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            className="rounded-button border border-secondary px-5 py-2.5 flex-row items-center"
          >
            <Text className="text-label font-sans-semibold text-secondary">
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skin Overview Section */}
        <View className="bg-card rounded-card border border-border p-5 mb-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-h3 font-sans-bold text-text">
              Skin Overview
            </Text>
            <View className="flex-row items-center bg-primary/15 px-3 py-1 rounded-badge">
              <Sparkles size={14} color={theme.colors.primary} />
              <Text className="text-caption font-sans-semibold text-primary ml-1.5">
                Active Scan
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-border/60">
            <View className="flex-1 mr-4">
              <Text className="text-caption font-sans-medium text-muted">DETECTED SKIN TYPE</Text>
              <Text className="text-h2 font-sans-bold text-text mt-0.5">Oily</Text>
              <Text className="text-body-sm font-sans text-muted mt-1">
                Moderately active sebum production across T-zone with balanced cheeks.
              </Text>
            </View>
            <View className="w-20 h-20 rounded-full border-4 border-primary items-center justify-center bg-primary/5">
              <Text className="text-h2 font-sans-bold text-primary">78%</Text>
              <Text className="text-caption font-sans-medium text-muted">Good</Text>
            </View>
          </View>
        </View>

        {/* Profile Information List */}
        <View className="bg-card rounded-card border border-border p-4 mb-5 shadow-sm">
          <Text className="text-h3 font-sans-bold text-text px-2 pt-1 pb-3">
            Profile Details
          </Text>

          {/* Age Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-3 px-2 border-b border-border/50"
          >
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center mr-3.5">
              <User size={18} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">Age</Text>
              <Text className="text-body-sm font-sans text-muted">20 years old</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.muted} />
          </TouchableOpacity>

          {/* Pregnant Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-3 px-2 border-b border-border/50"
          >
            <View className="w-9 h-9 rounded-full bg-secondary/15 items-center justify-center mr-3.5">
              <Heart size={18} color={theme.colors.secondary} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">Pregnant</Text>
              <Text className="text-body-sm font-sans text-muted">No</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.muted} />
          </TouchableOpacity>

          {/* Allergen Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-3 px-2"
          >
            <View className="w-9 h-9 rounded-full bg-error/15 items-center justify-center mr-3.5">
              <AlertCircle size={18} color={theme.colors.error} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">Allergens</Text>
              <Text className="text-body-sm font-sans text-muted">None specified</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Security Assurance Banner */}
        <View className="bg-primary/10 rounded-card border border-primary/20 p-4 mb-2 flex-row items-center">
          <ShieldCheck size={28} color={theme.colors.primary} className="mr-3" />
          <View className="flex-1 ml-3">
            <Text className="text-body font-sans-bold text-text">
              Your Information is Safe
            </Text>
            <Text className="text-body-sm font-sans text-muted mt-0.5">
              Your scan data and personal information are encrypted and never shared.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
