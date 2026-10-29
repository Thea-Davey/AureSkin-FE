import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { theme } from '@/shared/theme';
import { useHome } from '../viewmodel/useHome';
import { HeroCard } from './components/HeroCard';
import { S1LatestAnalysis } from './containers/s1_LatestAnalysis';
import { S2TodayRoutine } from './containers/s2_TodayRoutine';
import { S3SkinTestGuide } from './containers/s3_SkinTestGuide';
import { S4Articles } from './containers/s4_Articles';
import { S5FAQs } from './containers/s5_FAQs';

export function HomePage() {
  const router = useRouter();

  const {
    latestAnalysis,
    isLatestAnalysisLoading,
    routineSteps,
    routineLabel,
    routineSubtitle,
    isRoutineLoading,
    articles,
    isArticlesLoading,
    articlesError,
    faqs,
    isRefreshing,
    onRefresh,
  } = useHome();

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" backgroundColor={theme.colors.primary} />

      {/* Scrollable Dashboard Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.card}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Upper Dashboard Cards (Primary Olive Background) */}
        <View className="px-4 space-y-4 gap-4 pt-3.5 pb-2">
          {/* 1. Hero Card: "How is your skin today?" */}
          <HeroCard onScanPress={() => router.push('/(tabs)/scan')} />

          {/* 2. Latest Analysis Result Section */}
          <S1LatestAnalysis
            latestAnalysis={latestAnalysis}
            isLoading={isLatestAnalysisLoading}
          />

          {/* 3. Today's Skincare Routine Section */}
          <S2TodayRoutine
            steps={routineSteps}
            routineLabel={routineLabel}
            subtitle={routineSubtitle}
            isLoading={isRoutineLoading}
          />
        </View>

        {/* Lower Dashboard Section: White Curved Sheet Starts Here */}
        <View className="bg-card rounded-t-card px-5 pt-6 pb-28 mt-2 shadow-sm min-h-screen">
          {/* 1. Learn more about Skincare! */}
          <View className="mb-2">
            <Text className="text-h3 font-sans-bold text-text mb-3">
              Learn more about Skincare!
            </Text>
            <S3SkinTestGuide />
          </View>

          {/* 2. Interesting for you */}
          <View className="mb-4">
            <Text className="text-h3 font-sans-bold text-text mb-3">
              Interesting for you
            </Text>
            <S4Articles
              articles={articles}
              isLoading={isArticlesLoading}
              error={articlesError}
            />
          </View>

          {/* 3. Frequently Asked Questions (FAQs) */}
          <View className="mt-2">
            <Text className="text-h3 font-sans-bold text-text mb-3">
              Frequently Asked Questions (FAQs)
            </Text>
            <S5FAQs faqs={faqs} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default HomePage;
