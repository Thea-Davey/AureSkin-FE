import { Redirect } from 'expo-router';

/**
 * Route fallback redirect for /history.
 * Redirects to the main (tabs)/history route to prevent unmatched route 404s.
 */
export default function HistoryIndexRedirect() {
  return <Redirect href="/(tabs)/history" />;
}

