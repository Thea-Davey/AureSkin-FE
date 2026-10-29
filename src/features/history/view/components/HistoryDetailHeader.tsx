import { theme } from '@/shared/theme';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

export type HistoryDetailTab = 'results' | 'compatibility';

interface HistoryDetailHeaderProps {
  createdAt: string | null;
  activeTab: HistoryDetailTab;
  onBack: () => void;
  onSelectTab: (tab: HistoryDetailTab) => void;
}

function formatDate(value: string | null): string {
  if (!value) return 'Scan date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Scan date unavailable'
    : date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function HistoryDetailHeader({ createdAt, activeTab, onBack, onSelectTab }: HistoryDetailHeaderProps) {
  return (
    <View className="bg-primary px-4 pb-4 pt-2">
      <View className="mb-4 min-h-12 flex-row items-center">
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to history"
          className="mr-3 h-10 w-10 items-center justify-center rounded-full active:opacity-75"
        >
          <ArrowLeft size={23} color={theme.colors.white} />
        </Pressable>
        <View className="min-w-0 flex-1 flex-row items-baseline">
          <Text numberOfLines={1} className="shrink text-h3 font-sans-bold text-neutral-white">
            Skin Analysis:
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            className="ml-2 min-w-0 flex-1 text-body-sm font-sans text-neutral-white/80"
          >
            {formatDate(createdAt)}
          </Text>
        </View>
      </View>

      <View className="flex-row rounded-button bg-primary-dark p-1">
        <Pressable
          onPress={() => onSelectTab('results')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'results' }}
          className={`h-10 flex-1 items-center justify-center rounded-button px-1 ${activeTab === 'results' ? 'bg-secondary' : ''}`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            className={`text-caption font-sans-semibold ${activeTab === 'results' ? 'text-text' : 'text-neutral-white'}`}
          >
            Results
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onSelectTab('compatibility')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'compatibility' }}
          className={`h-10 flex-1 items-center justify-center rounded-button px-1 ${activeTab === 'compatibility' ? 'bg-secondary' : ''}`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            className={`text-caption font-sans-semibold ${activeTab === 'compatibility' ? 'text-text' : 'text-neutral-white'}`}
          >
            Ingredient Compatibility
          </Text>
        </Pressable>
      </View>
    </View>
  );
}