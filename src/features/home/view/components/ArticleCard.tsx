import React from 'react';
import { View, Text, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components';
import { Article } from '../../model/home_types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const handleOpenArticle = async () => {
    if (!article.url) return;
    try {
      await WebBrowser.openBrowserAsync(article.url);
    } catch {
      // Graceful fallback if in-app browser fails
    }
  };

  return (
    <Card
      onPress={handleOpenArticle}
      accessibilityRole="button"
      accessibilityLabel={`View article: ${article.title}`}
      className="p-4 mb-4"
    >
      {/* Top Row: Title + "See Article" Link */}
      <View className="flex-row items-center justify-between mb-2.5">
        <Text
          numberOfLines={2}
          className="text-body-sm font-sans-bold text-text flex-1 pr-3"
        >
          {article.title}
        </Text>
        <View className="flex-row items-center self-start pt-0.5">
          <Text className="text-caption font-sans-medium text-muted mr-0.5">
            See Article
          </Text>
          <ChevronRight size={14} color={theme.colors.muted} />
        </View>
      </View>

      {/* Wide Banner Image Below */}
      <View className="w-full h-[140px] rounded-button overflow-hidden bg-background">
        {article.image_url ? (
          <Image
            source={{ uri: article.image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-background">
            <Text className="text-caption font-sans-medium text-primary">
              Skincare Insights
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
