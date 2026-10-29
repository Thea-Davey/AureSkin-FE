import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { theme } from '../../../shared/theme';
import { useAddProductUpload } from '../viewmodel/useAddProductUpload';

export function AddProductUploadPage() {
  const upload = useAddProductUpload();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-neutral-text">
      <StatusBar style="light" />
      <View className="flex-row items-center justify-between border-b border-neutral-white/10 px-4 pb-4 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to product camera"
          onPress={upload.actions.goBack}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-neutral-white/10"
        >
          <ChevronLeft size={26} color={theme.colors.card} />
        </Pressable>
        <Text className="text-h3 font-sans-bold text-neutral-white">Upload a Photo</Text>
        <View className="h-10 w-10" />
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-neutral-white/10">
          <ImageIcon size={30} color={theme.colors.card} />
        </View>
        <Text className="mt-4 text-center text-h3 font-sans-semibold text-neutral-white">
          Choose a product photo
        </Text>
        <Text className="mt-2 text-center text-body-sm font-sans text-neutral-white/80">
          Browse your device photos and select a clear picture of the product or its ingredient label.
        </Text>

        {upload.error ? (
          <Text accessibilityRole="alert" className="mt-4 text-center text-body-sm font-sans text-neutral-white">
            {upload.error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: upload.isPicking }}
          disabled={upload.isPicking}
          onPress={() => void upload.actions.pickPhoto()}
          className="mt-6 min-w-48 flex-row items-center justify-center gap-2 rounded-button bg-primary px-5 py-3 active:opacity-80 disabled:opacity-50"
        >
          {upload.isPicking ? (
            <ActivityIndicator size="small" color={theme.colors.card} />
          ) : (
            <ImageIcon size={18} color={theme.colors.card} />
          )}
          <Text className="text-label font-sans-semibold text-neutral-white">
            {upload.isPicking ? 'Opening photos...' : 'Choose from device'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
