import React from 'react';
import { View } from 'react-native';
import { FAQ } from '../../model/home_types';
import { FAQItem } from '../components/FAQItem';

interface S5FAQsProps {
  faqs: FAQ[];
}

export function S5FAQs({ faqs }: S5FAQsProps) {
  return (
    <View className="mb-4">
      {faqs.map((faq) => (
        <FAQItem key={faq.id} faq={faq} />
      ))}
    </View>
  );
}
