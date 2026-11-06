import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Cpu,
  Database,
  GraduationCap,
  ChevronRight,
  FileText,
  Users,
} from 'lucide-react-native';
import { ModalHeader } from '@/shared/components/ModalHeader';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme';
import { useAbout } from '../viewmodel/useAbout';
import { HeroBranding } from './components/HeroBranding';
import { TeamCard } from './components/TeamCard';

export function AboutPage() {
  const router = useRouter();
  const { aboutInfo, developer, researchers, isLoading } = useAbout();

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="About AureSkin" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Container 1: Hero Branding (Outer container wrapper removed as requested) */}
          <HeroBranding
            version={aboutInfo?.version}
            releaseDate={aboutInfo?.releaseDate}
          />

          {/* Container 2: Mission Statement */}
          <Card style={2} className="mb-4 p-5 items-stretch">
            <Text className="text-h3 font-sans-bold text-text mb-2">
              Our Purpose
            </Text>
            <Text className="text-body-sm font-sans text-muted leading-6">
              {aboutInfo?.mission}
            </Text>
          </Card>

          {/* Container 3: Core Technologies */}
          <Card style={2} className="mb-4 p-5 items-stretch">
            <Text className="text-h3 font-sans-bold text-text mb-3">
              Core Technologies
            </Text>

            {/* Tech 1 */}
            <View className="mb-4 flex-row items-start">
              <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Cpu size={18} color={theme.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body font-sans-semibold text-text">
                  MobileNetV3 Deep Learning
                </Text>
                <Text className="mt-0.5 text-body-sm font-sans text-muted">
                  Specialized CNN models for 5-class skin type determination and 8-condition multi-label detection.
                </Text>
              </View>
            </View>

            {/* Tech 2 */}
            <View className="mb-4 flex-row items-start">
              <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-secondary/15">
                <ShieldCheck size={18} color={theme.colors.secondary} />
              </View>
              <View className="flex-1">
                <Text className="text-body font-sans-semibold text-text">
                  MediaPipe 468-Point Mesh
                </Text>
                <Text className="mt-0.5 text-body-sm font-sans text-muted">
                  Dynamic 3D facial landmark detection ensuring tilt-invariant anatomical T-zone and cheek cropping.
                </Text>
              </View>
            </View>

            {/* Tech 3 */}
            <View className="flex-row items-start">
              <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Database size={18} color={theme.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-body font-sans-semibold text-text">
                  Harmful Pairs Relational Engine
                </Text>
                <Text className="mt-0.5 text-body-sm font-sans text-muted">
                  Deterministic conflict matching flagging dangerous active ingredient interactions.
                </Text>
              </View>
            </View>
          </Card>

          {/* Container 4: Institution & Research Team */}
          <Card style={2} className="mb-4 p-5 items-stretch">
            <View className="mb-2 flex-row items-center">
              <GraduationCap size={22} color={theme.colors.primary} />
              <Text className="ml-2 text-h3 font-sans-bold text-text">
                Academic Affiliation
              </Text>
            </View>
            <Text className="text-body-sm font-sans text-muted leading-6">
              Developed as an academic software engineering capstone research project at:
            </Text>
            <Text className="mt-1 text-body font-sans-bold text-text">
              {aboutInfo?.academicAffiliation.institution ?? 'De La Salle University — Dasmariñas (DLSUD)'}
            </Text>
            <Text className="mt-0.5 text-caption font-sans-medium text-muted">
              {aboutInfo?.academicAffiliation.college ?? 'College of Science and Computer Studies (CSCS)'}
            </Text>

            {/* Team Showcase Divider & Sub-Section */}
            <View className="my-4 border-b border-border/60" />

            <View className="mb-2 flex-row items-center">
              <Users size={18} color={theme.colors.primary} />
              <Text className="ml-2 text-body font-sans-bold text-text">
                Research & Development Team
              </Text>
            </View>
            <Text className="mb-3.5 text-caption font-sans text-muted leading-4">
              The project members behind AureSkin&apos;s neural skin models and algorithmic compatibility matrix:
            </Text>

            {/* 1 Developer */}
            {developer && <TeamCard member={developer} />}

            {/* 2 Researchers */}
            {researchers.map((researcher) => (
              <TeamCard key={researcher.id} member={researcher} />
            ))}
          </Card>

          {/* Container 5: Legal & Policy Links (Fixed spacing & balanced buttons) */}
          <Card style={2} className="mb-4 p-4 items-stretch">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/legal', params: { tab: 'terms' } })}
              className="flex-row items-center rounded-button px-3 py-3.5"
              accessibilityRole="button"
              accessibilityLabel="View Terms of Service"
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <FileText size={18} color={theme.colors.primary} />
              </View>
              <Text className="flex-1 text-body font-sans-medium text-text">
                Terms of Service
              </Text>
              <ChevronRight size={18} color={theme.colors.muted} />
            </TouchableOpacity>

            <View className="my-1 border-b border-border/50" />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/legal', params: { tab: 'privacy' } })}
              className="flex-row items-center rounded-button px-3 py-3.5"
              accessibilityRole="button"
              accessibilityLabel="View Privacy Policy and Disclaimers"
            >
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-secondary/15">
                <ShieldCheck size={18} color={theme.colors.secondary} />
              </View>
              <Text className="flex-1 text-body font-sans-medium text-text">
                Privacy Policy & Disclaimers
              </Text>
              <ChevronRight size={18} color={theme.colors.muted} />
            </TouchableOpacity>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

export default AboutPage;
