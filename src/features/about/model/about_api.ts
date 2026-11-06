import { AboutInfo } from './about_types';
import { MOCK_ABOUT_INFO } from './about_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';

export const USE_MOCK: boolean = isMockEnabled('about');

/**
 * Fetch application metadata, core technologies, and research team details.
 */
export async function fetchAboutInfo(): Promise<AboutInfo> {
  if (isMockEnabled('about')) {
    return MOCK_ABOUT_INFO;
  }

  // Future backend endpoint integration
  return MOCK_ABOUT_INFO;
}

