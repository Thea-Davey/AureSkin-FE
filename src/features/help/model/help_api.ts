import { HelpData } from './help_types';
import { MOCK_HELP_DATA } from './help_mock';
import { isMockEnabled } from '@/shared/config/mockConfig';

export const USE_MOCK: boolean = isMockEnabled('help');

/**
 * Fetch help guides, diagnostics metadata, and support details.
 */
export async function fetchHelpData(): Promise<HelpData> {
  if (isMockEnabled('help')) {
    return MOCK_HELP_DATA;
  }

  // Future backend / diagnostics API
  return MOCK_HELP_DATA;
}

/**
 * Clear cached thumbnail assets and temp scan images.
 */
export async function clearPhotoCache(): Promise<{ freedBytes: number; success: boolean }> {
  // Simulate cache purge
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { freedBytes: 14200000, success: true }; // ~14.2 MB
}

