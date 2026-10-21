import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { HelpCircle, Mail, ChevronDown, ChevronUp, Camera, Sparkles, BookOpen } from 'lucide-react-native';
import { ModalHeader } from '../../../shared/components/ModalHeader';
import { theme } from '../../../shared/theme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How accurate is the AureSkin skin analysis?',
    answer:
      'AureSkin uses specialized MobileNetV3 deep learning models coupled with MediaPipe 3D face mesh normalization to inspect localized facial zones. While highly accurate for personal tracking and education, it is intended as a cosmetic skin health companion rather than a formal medical diagnosis.',
  },
  {
    id: 'faq-2',
    question: 'Can I customize steps or swap products in my routine?',
    answer:
      'Yes! Your generated routine is fully customizable. You can tap on any routine step card to swap the recommended product with any alternative from the Library that fits your skin profile.',
  },
  {
    id: 'faq-3',
    question: 'How do I add a product that is not in the Library?',
    answer:
      'Navigate to the Library screen, switch to the Products tab, and tap the Add Product button. You can enter the product name, brand, category, and list of ingredients.',
  },
  {
    id: 'faq-4',
    question: 'How is my scan photo stored and protected?',
    answer:
      'Your face photos are uploaded to private, secure Supabase Storage buckets accessible strictly by your authenticated account. Photos are never shared or made public.',
  },
];

export default function HelpPage() {
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Help & Support" />

      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Tips Section */}
        <Text className="text-h3 font-sans-bold text-text mb-3">
          Quick Guides
        </Text>

        {/* Tip 1 */}
        <View className="bg-primary/10 rounded-card border border-primary/20 p-4 mb-3 flex-row items-start">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3 mt-0.5">
            <Camera size={20} color={theme.colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body font-sans-bold text-text">
              Best Scan Results
            </Text>
            <Text className="text-body-sm font-sans text-muted mt-1 leading-5">
              Take photos in neutral, indirect daylight with a clean face and no filters to ensure accurate sebum and condition readings.
            </Text>
          </View>
        </View>

        {/* Tip 2 */}
        <View className="bg-secondary/10 rounded-card border border-secondary/20 p-4 mb-5 flex-row items-start">
          <View className="w-10 h-10 rounded-full bg-secondary/20 items-center justify-center mr-3 mt-0.5">
            <Sparkles size={20} color={theme.colors.secondary} />
          </View>
          <View className="flex-1">
            <Text className="text-body font-sans-bold text-text">
              Ingredient Safety
            </Text>
            <Text className="text-body-sm font-sans text-muted mt-1 leading-5">
              Always review the Incompatible Pairs tab after a scan before mixing strong actives like Retinol with AHA/BHA acids.
            </Text>
          </View>
        </View>

        {/* FAQs Section */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-h3 font-sans-bold text-text">
            Frequently Asked Questions
          </Text>
          <HelpCircle size={18} color={theme.colors.muted} />
        </View>

        {FAQS.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <View
              key={faq.id}
              className="bg-card rounded-card border border-border mb-3 overflow-hidden shadow-sm"
            >
              <TouchableOpacity
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-4"
              >
                <Text className="text-body font-sans-semibold text-text flex-1 mr-3 leading-5">
                  {faq.question}
                </Text>
                {isExpanded ? (
                  <ChevronUp size={18} color={theme.colors.primary} />
                ) : (
                  <ChevronDown size={18} color={theme.colors.muted} />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View className="px-4 pb-4 pt-1 border-t border-border/40">
                  <Text className="text-body-sm font-sans text-muted leading-6">
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Contact Support Footer Card */}
        <View className="bg-card rounded-card border border-border p-5 mt-3 mb-2 items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-2.5">
            <Mail size={22} color={theme.colors.primary} />
          </View>
          <Text className="text-body font-sans-bold text-text text-center">
            Still Have Questions?
          </Text>
          <Text className="text-body-sm font-sans text-muted text-center mt-1">
            Reach out to our support and capstone team directly at:
          </Text>
          <Text className="text-body font-sans-bold text-primary mt-1">
            support@aureskin.app
          </Text>
          <Text className="text-caption font-sans text-muted mt-2">
            Average response time: 24 to 48 hours
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
