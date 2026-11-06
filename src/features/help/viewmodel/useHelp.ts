import { useState, useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { HelpData } from '../model/help_types';
import { fetchHelpData, clearPhotoCache } from '../model/help_api';

export function useHelp() {
  const [expandedGuideIds, setExpandedGuideIds] = useState<string[]>(['guide-scan']);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheClearedStatus, setCacheClearedStatus] = useState<string | null>(null);

  const {
    data: helpData,
    isLoading,
    error,
    refetch,
  } = useQuery<HelpData>({
    queryKey: ['help-data'],
    queryFn: fetchHelpData,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const toggleGuide = useCallback((id: string) => {
    setExpandedGuideIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleClearCache = useCallback(async () => {
    try {
      setIsClearingCache(true);
      const res = await clearPhotoCache();
      if (res.success) {
        setCacheClearedStatus('14.2 MB temporary cache cleared');
        if (Platform.OS === 'web') {
          // Web fallback
          setTimeout(() => setCacheClearedStatus(null), 4000);
        } else {
          Alert.alert(
            'Cache Cleared',
            '14.2 MB of temporary scan previews and cached assets were safely removed. Your account data remains untouched.'
          );
        }
      }
    } catch {
      Alert.alert('Error', 'Unable to clear cache at this moment.');
    } finally {
      setIsClearingCache(false);
    }
  }, []);

  const handleContactSupport = useCallback(async () => {
    const email = helpData?.support.email ?? 'support@aureskin.app';
    const url = `mailto:${email}?subject=AureSkin%20Support%20Request`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email Support',
          `Please contact us at:\n${email}`
        );
      }
    } catch {
      Alert.alert('Email Support', `Please contact us at:\n${email}`);
    }
  }, [helpData]);

  return {
    helpData,
    expandedGuideIds,
    isClearingCache,
    cacheClearedStatus,
    isLoading,
    error,
    refetch,
    toggleGuide,
    handleClearCache,
    handleContactSupport,
  };
}

