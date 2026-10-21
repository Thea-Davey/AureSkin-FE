import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldCheck, Cpu, Database, GraduationCap, ChevronRight, Sparkles, FileText } from 'lucide-react-native';
import { ModalHeader } from '../../../shared/components/ModalHeader';
import { theme } from '../../../shared/theme';

export default function AboutPage() {
  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="About AureSkin" />

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Banner Card */}
        <View className="bg-card rounded-card border border-border p-6 mb-5 items-center shadow-sm">
          <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Sparkles size={36} color={theme.colors.primary} />
          </View>
          <Text className="text-display font-heading text-primary">
            AureSkin
          </Text>
          <Text className="text-body font-sans-medium text-text mt-1 text-center">
            Your Personal Skin Health Companion
          </Text>
          <View className="mt-3 px-3.5 py-1 rounded-badge bg-neutral-border">
            <Text className="text-caption font-sans-semibold text-neutral-text">
              Version 1.0.0 (Release 2026.1)
            </Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View className="bg-card rounded-card border border-border p-5 mb-5 shadow-sm">
          <Text className="text-h3 font-sans-bold text-text mb-2">
            Our Purpose
          </Text>
          <Text className="text-body-sm font-sans text-muted leading-6">
            AureSkin makes personalized, dermatological skincare intelligence accessible to everyone. By pairing computer vision facial analysis with empirical ingredient compatibility evaluation, we empower users to understand their skin, track barrier health, and make informed cosmetic decisions.
          </Text>
        </View>

        {/* Technology & Methodology */}
        <View className="bg-card rounded-card border border-border p-5 mb-5 shadow-sm">
          <Text className="text-h3 font-sans-bold text-text mb-3">
            Core Technologies
          </Text>

          {/* Tech 1 */}
          <View className="flex-row items-start mb-4">
            <View className="w-9 h-9 rounded-full bg-primary/15 items-center justify-center mr-3 mt-0.5">
              <Cpu size={18} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">
                MobileNetV3 Deep Learning
              </Text>
              <Text className="text-body-sm font-sans text-muted mt-0.5">
                Specialized CNN models for 5-class skin type determination and 8-condition multi-label detection.
              </Text>
            </View>
          </View>

          {/* Tech 2 */}
          <View className="flex-row items-start mb-4">
            <View className="w-9 h-9 rounded-full bg-secondary/15 items-center justify-center mr-3 mt-0.5">
              <ShieldCheck size={18} color={theme.colors.secondary} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">
                MediaPipe 468-Point Mesh
              </Text>
              <Text className="text-body-sm font-sans text-muted mt-0.5">
                Dynamic 3D facial landmark detection ensuring tilt-invariant anatomical T-zone and cheek cropping.
              </Text>
            </View>
          </View>

          {/* Tech 3 */}
          <View className="flex-row items-start">
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
              <Database size={18} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-body font-sans-semibold text-text">
                Harmful Pairs Relational Engine
              </Text>
              <Text className="text-body-sm font-sans text-muted mt-0.5">
                Deterministic conflict matching flagging dangerous active ingredient interactions.
              </Text>
            </View>
          </View>
        </View>

        {/* Institution & Credits */}
        <View className="bg-card rounded-card border border-border p-5 mb-5 shadow-sm">
          <View className="flex-row items-center mb-2">
            <GraduationCap size={22} color={theme.colors.primary} className="mr-2" />
            <Text className="text-h3 font-sans-bold text-text ml-2">
              Academic Affiliation
            </Text>
          </View>
          <Text className="text-body-sm font-sans text-muted leading-6">
            Developed as an academic software engineering capstone research project at:
          </Text>
          <Text className="text-body font-sans-bold text-text mt-1">
            De La Salle University — Dasmariñas (DLSUD)
          </Text>
          <Text className="text-caption font-sans-medium text-muted mt-0.5">
            College of Science and Computer Studies (CSCS)
          </Text>
        </View>

        {/* Legal & Policy Links */}
        <View className="bg-card rounded-card border border-border p-4 mb-2 shadow-sm">
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-3 px-2 border-b border-border/50"
          >
            <FileText size={18} color={theme.colors.muted} className="mr-3" />
            <Text className="text-body font-sans-medium text-text flex-1 ml-2">
              Terms of Service
            </Text>
            <ChevronRight size={18} color={theme.colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center py-3 px-2"
          >
            <ShieldCheck size={18} color={theme.colors.muted} className="mr-3" />
            <Text className="text-body font-sans-medium text-text flex-1 ml-2">
              Privacy Policy & Disclaimers
            </Text>
            <ChevronRight size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
