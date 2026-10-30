import { Text, View } from 'react-native';

interface AlphabetHeaderProps {
  letter: string;
}

export function AlphabetHeader({ letter }: AlphabetHeaderProps) {
  return (
    <View className="w-full bg-secondary px-5 py-1.5">
      <Text className="text-h3 font-sans-bold text-neutral-white">
        {letter}
      </Text>
    </View>
  );
}
