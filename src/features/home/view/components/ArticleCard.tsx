import React, { useState } from 'react';
import { View, Text, Image, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/shared/theme';
import { Card } from '@/shared/components';
import { Article } from '../../model/home_types';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleOpenArticle = async () => {
    if (!article.url || !article.url.trim()) return;

    let targetUrl = article.url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      await WebBrowser.openBrowserAsync(targetUrl);
    } catch {
      try {
        await Linking.openURL(targetUrl);
      } catch (err) {
        console.warn('[ArticleCard] Failed to open article URL:', err);
      }
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
      <View className="flex-row items-center justify-between mb-2">
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

      {/* Summary Snippet if available */}
      {article.summary ? (
        <Text
          numberOfLines={2}
          className="text-caption font-sans text-muted mb-2.5 leading-4"
        >
          {article.summary}
        </Text>
      ) : null}

      {/* Wide Banner Image Below */}
      <View className="w-full h-[140px] rounded-button overflow-hidden bg-background">
        {article.image_url && !imageError ? (
          <Image
            source={{ uri: article.image_url }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-secondary/15 px-4">
            <Text className="text-body-sm font-sans-bold text-primary text-center">
              {article.category || 'Skincare Insights'}
            </Text>
            {article.source ? (
              <Text className="text-caption font-sans text-muted mt-1 text-center">
                {article.source}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </Card>
  );
}
