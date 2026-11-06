import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react-native';
import { ModalHeader } from '@/shared/components/ModalHeader';
import { Card } from '@/shared/components/Card';
import { theme } from '@/shared/theme';
import { LegalTab } from '../model/legal_types';
import { LEGAL_CONTENTS } from '../model/legal_content';

export function LegalPage() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab: LegalTab =
    params.tab === 'privacy'
      ? 'privacy'
      : params.tab === 'disclaimers'
      ? 'disclaimers'
      : 'terms';

  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const currentContent = LEGAL_CONTENTS[activeTab] ?? LEGAL_CONTENTS.terms;

  const tabPills: { id: LegalTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'terms',
      label: 'Terms',
      icon: (
        <FileText
          size={14}
          color={activeTab === 'terms' ? theme.colors.card : theme.colors.muted}
          className="mr-1.5"
        />
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: (
        <ShieldCheck
          size={14}
          color={activeTab === 'privacy' ? theme.colors.card : theme.colors.muted}
          className="mr-1.5"
        />
      ),
    },
    {
      id: 'disclaimers',
      label: 'Disclaimers',
      icon: (
        <AlertTriangle
          size={14}
          color={activeTab === 'disclaimers' ? theme.colors.card : theme.colors.muted}
          className="mr-1.5"
        />
      ),
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title={currentContent.title} />

      {/* 3-Tab Segmented Pill Navigation */}
      <View className="flex-row px-5 pt-3 pb-3 bg-background border-b border-border/40">
        {tabPills.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-badge mx-1 ${
                isActive ? 'bg-primary' : 'bg-card border border-border'
              }`}
            >
              {tab.icon}
              <Text
                className={`text-caption font-sans-semibold ${
                  isActive ? 'text-neutral-white' : 'text-text'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Main Content Area */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Summary Card */}
        <Card style={2} className="p-5 mb-4 items-stretch">
          <Text className="text-h3 font-sans-bold text-text">
            {currentContent.title}
          </Text>
          <Text className="text-body-sm font-sans text-muted mt-1 leading-5">
            {currentContent.subtitle}
          </Text>
          <View className="mt-3 pt-2.5 border-t border-border/40 flex-row items-center justify-between">
            <Text className="text-caption font-sans-medium text-muted">
              Last Updated: {currentContent.lastUpdated}
            </Text>
            <View className="px-2.5 py-0.5 rounded-badge bg-secondary/15">
              <Text className="text-caption font-sans-bold text-secondary-dark">
                Official AureSkin Policy
              </Text>
            </View>
          </View>
        </Card>

        {/* Section Cards */}
        {currentContent.sections.map((section, index) => (
          <Card key={index} style={2} className="p-5 mb-3.5 items-stretch">
            <Text className="text-body font-sans-bold text-text mb-2.5">
              {section.title}
            </Text>
            {section.content.map((paragraph, pIdx) => (
              <Text
                key={pIdx}
                className="text-body-sm font-sans text-muted leading-6 mb-2"
              >
                {paragraph}
              </Text>
            ))}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

export default LegalPage;

