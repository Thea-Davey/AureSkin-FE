import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AboutInfo } from '../model/about_types';
import { fetchAboutInfo } from '../model/about_api';

export function useAbout() {
  const {
    data: aboutInfo,
    isLoading,
    error,
    refetch,
  } = useQuery<AboutInfo>({
    queryKey: ['about-info'],
    queryFn: fetchAboutInfo,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const developer = useMemo(
    () => aboutInfo?.team.find((m) => m.isDeveloper),
    [aboutInfo]
  );

  const researchers = useMemo(
    () => aboutInfo?.team.filter((m) => !m.isDeveloper) ?? [],
    [aboutInfo]
  );

  return {
    aboutInfo,
    developer,
    researchers,
    isLoading,
    error,
    refetch,
  };
}

