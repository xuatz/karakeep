import { Pressable, View } from "react-native";
import { NotepadText } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { Text } from "../ui/Text";

interface NotePreviewProps {
  note: string;
  onPress: () => void;
}

export function NotePreview({ note, onPress }: NotePreviewProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#9ca3af" : "#6b7280";

  if (!note?.trim()) {
    return null;
  }

  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-row items-center gap-2">
        <NotepadText size={24} color={iconColor} />
        <Text
          className="flex-1 text-sm italic text-gray-500 dark:text-gray-400"
          numberOfLines={2}
        >
          {note}
        </Text>
      </View>
    </Pressable>
  );
}
