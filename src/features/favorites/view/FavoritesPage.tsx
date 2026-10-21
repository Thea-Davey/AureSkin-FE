import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Sparkles, Bookmark, CheckCircle2 } from 'lucide-react-native';
import { ModalHeader } from '../../../shared/components/ModalHeader';
import { theme } from '../../../shared/theme';

type FilterType = 'all' | 'products' | 'ingredients';

export default function FavoritesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const sampleFavorites = [
    {
      id: 'fav-1',
      type: 'product',
      title: 'Hydrating Gentle Foam Cleanser',
      brand: 'CeraVe',
      category: 'Cleanser',
      matchScore: '96% Compatible',
      description: 'Contains Ceramides & Hyaluronic Acid to gently restore the moisture barrier.',
    },
    {
      id: 'fav-2',
      type: 'ingredient',
      title: 'Niacinamide (Vitamin B3)',
      brand: 'Active Ingredient',
      category: 'Pore & Sebum Control',
      matchScore: '100% Compatible',
      description: 'Strengthens epidermal barrier function and regulates excess sebum excretion.',
    },
    {
      id: 'fav-3',
      type: 'product',
      title: 'Daily UV Barrier Mineral SPF 50+',
      brand: 'La Roche-Posay',
      category: 'Sunscreen',
      matchScore: '92% Compatible',
      description: 'Broad-spectrum physical protection suitable for sensitive, acne-prone skin.',
    },
  ];

  const filteredItems = sampleFavorites.filter((item) => {
    if (activeFilter === 'products') return item.type === 'product';
    if (activeFilter === 'ingredients') return item.type === 'ingredient';
    return true;
  });

  return (
    <View className="flex-1 bg-background">
      <ModalHeader title="Favorites" />

      {/* Filter Tabs */}
      <View className="flex-row px-5 pt-4 pb-3 bg-background border-b border-border/50">
        <TouchableOpacity
          onPress={() => setActiveFilter('all')}
          activeOpacity={0.8}
          className={`px-4 py-2 rounded-badge mr-2.5 ${
            activeFilter === 'all'
              ? 'bg-primary'
              : 'bg-card border border-border'
          }`}
        >
          <Text
            className={`text-caption font-sans-semibold ${
              activeFilter === 'all' ? 'text-neutral-white' : 'text-muted'
            }`}
          >
            All (3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('products')}
          activeOpacity={0.8}
          className={`px-4 py-2 rounded-badge mr-2.5 ${
            activeFilter === 'products'
              ? 'bg-primary'
              : 'bg-card border border-border'
          }`}
        >
          <Text
            className={`text-caption font-sans-semibold ${
              activeFilter === 'products' ? 'text-neutral-white' : 'text-muted'
            }`}
          >
            Products (2)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('ingredients')}
          activeOpacity={0.8}
          className={`px-4 py-2 rounded-badge ${
            activeFilter === 'ingredients'
              ? 'bg-primary'
              : 'bg-card border border-border'
          }`}
        >
          <Text
            className={`text-caption font-sans-semibold ${
              activeFilter === 'ingredients' ? 'text-neutral-white' : 'text-muted'
            }`}
          >
            Ingredients (1)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View className="items-center justify-center py-20 px-6">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Bookmark size={30} color={theme.colors.primary} />
            </View>
            <Text className="text-h3 font-sans-bold text-text text-center">
              No favorites in this category
            </Text>
            <Text className="text-body-sm font-sans text-muted text-center mt-1">
              Tap the heart icon on any product or ingredient in the Library to save it here.
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View
              key={item.id}
              className="bg-card rounded-card border border-border p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="bg-primary/15 px-2.5 py-0.5 rounded-badge mr-2">
                    <Text className="text-caption font-sans-bold text-primary uppercase">
                      {item.type}
                    </Text>
                  </View>
                  <Text className="text-caption font-sans-medium text-muted">
                    {item.brand} • {item.category}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Heart size={20} color={theme.colors.error} fill={theme.colors.error} />
                </TouchableOpacity>
              </View>

              <Text className="text-h3 font-sans-bold text-text">
                {item.title}
              </Text>

              <Text className="text-body-sm font-sans text-muted mt-1 leading-5">
                {item.description}
              </Text>

              <View className="flex-row items-center mt-3 pt-2.5 border-t border-border/50">
                <CheckCircle2 size={15} color={theme.colors.secondary} />
                <Text className="text-caption font-sans-semibold text-secondary ml-1.5">
                  {item.matchScore}
                </Text>
                <View className="flex-1" />
                <View className="flex-row items-center">
                  <Sparkles size={13} color={theme.colors.muted} />
                  <Text className="text-caption font-sans text-muted ml-1">
                    Saved from Library
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
