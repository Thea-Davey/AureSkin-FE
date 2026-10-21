import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '@/shared/theme';
import { Article } from '../../model/home_types';
import { ArticleCard } from '../components/ArticleCard';

interface S4ArticlesProps {
  articles: Article[];
  isLoading: boolean;
  error?: string | null;
}

export function S4Articles({ articles, isLoading, error }: S4ArticlesProps) {
  return (
    <View className="mb-4">
      {isLoading && articles.length === 0 ? (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text className="text-muted text-caption font-sans-medium mt-2">
            Loading articles...
          </Text>
        </View>
      ) : articles.length === 0 ? (
        <View className="p-4 bg-background rounded-card items-center">
          <Text className="text-muted text-caption font-sans-medium">
            No articles available at this time.
          </Text>
        </View>
      ) : (
        articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
      )}
    </View>
  );
}
