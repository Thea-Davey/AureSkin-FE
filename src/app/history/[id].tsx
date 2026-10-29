import { useLocalSearchParams } from 'expo-router';
import { HistoryDetailPage } from '../../features/history/view/HistoryDetailPage';

export default function HistoryDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <HistoryDetailPage id={id} />;
}