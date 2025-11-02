import { Modal, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { ExternalLink, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

interface NoteModalProps {
  note: string;
  bookmarkId: string;
  visible: boolean;
  onClose: () => void;
}

export function NoteModal({
  note,
  bookmarkId,
  visible,
  onClose,
}: NoteModalProps) {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#d1d5db" : "#374151";

  if (!note?.trim()) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[80%] rounded-t-3xl bg-card p-6">
          {/* Header */}
          <View className="mb-4 flex flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Note</Text>
            <Pressable onPress={onClose} className="p-2">
              <X size={24} color={iconColor} />
            </Pressable>
          </View>

          {/* Note Content */}
          <ScrollView className="mb-4 max-h-96">
            <Text className="text-sm text-gray-700 dark:text-gray-300">
              {note}
            </Text>
          </ScrollView>

          {/* Action Button */}
          <View className="flex flex-row justify-end border-t border-border pt-4">
            <Button
              variant="secondary"
              onPress={() => {
                onClose();
                router.push(`/dashboard/bookmarks/${bookmarkId}/info`);
              }}
            >
              <Text className="text-sm">Edit in full view</Text>
              <ExternalLink size={14} color={iconColor} />
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
