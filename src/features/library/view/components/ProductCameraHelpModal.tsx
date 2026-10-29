import { Modal, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '../../../../shared/theme';

interface ProductCameraHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const PHOTO_TIPS = [
  'Use bright, even lighting and avoid glare on the label.',
  'Keep the product steady and the ingredient text in focus.',
  'Include the full product name and ingredient list in the frame.',
];

export function ProductCameraHelpModal({
  visible,
  onClose,
}: ProductCameraHelpModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/60">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close product photo tips"
          onPress={onClose}
          className="flex-1"
        />
        <View className="rounded-t-card bg-card px-5 pb-8 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-h3 font-sans-bold text-text">Photo tips</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close photo tips"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-background"
            >
              <X size={22} color={theme.colors.text} />
            </Pressable>
          </View>
          {PHOTO_TIPS.map((tip) => (
            <View key={tip} className="mb-3 flex-row items-start gap-3">
              <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <Text className="flex-1 text-body-sm font-sans text-text">{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}
