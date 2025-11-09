import { Platform } from "react-native";
import { useShareIntentContext as useExpoShareIntent } from "expo-share-intent";
import { useAndroidShareIntent } from "../modules/android-share-intent/useAndroidShareIntent";

/**
 * Platform-aware share intent hook
 * Uses custom implementation for Android and expo-share-intent for iOS
 */
export function useShareIntent() {
  if (Platform.OS === "android") {
    return useAndroidShareIntent();
  }

  // For iOS and other platforms, return the expo-share-intent result
  return useExpoShareIntent();
}

/**
 * Share Intent Provider - platform aware
 * For Android, no provider needed as we handle it in the native module
 * For iOS, we still use expo-share-intent's provider
 */
export { ShareIntentProvider } from "expo-share-intent";
