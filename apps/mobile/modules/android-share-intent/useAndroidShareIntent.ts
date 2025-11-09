import { useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as ExpoModules from "expo-modules-core";

// Import types
import type { ShareIntentData, AndroidShareIntentModule } from "./index";

// Get the native module
let AndroidShareIntent: AndroidShareIntentModule | null = null;
if (Platform.OS === "android") {
  try {
    AndroidShareIntent = ExpoModules.requireNativeModule<AndroidShareIntentModule>("AndroidShareIntent");
  } catch (error) {
    console.warn("AndroidShareIntent native module not found. Share intent will not work.", error);
  }
}

export interface UseShareIntentResult {
  hasShareIntent: boolean;
  shareIntent: ShareIntentData;
  resetShareIntent: () => void;
  error: string | null;
}

/**
 * Custom hook to handle Android share intents
 * This replaces expo-share-intent for Android to fix reliability issues
 */
export function useAndroidShareIntent(): UseShareIntentResult {
  const [hasShareIntent, setHasShareIntent] = useState(false);
  const [shareIntent, setShareIntent] = useState<ShareIntentData>({});
  const [error, setError] = useState<string | null>(null);

  // Check for share intent on mount and when app state changes
  useEffect(() => {
    if (Platform.OS !== "android" || !AndroidShareIntent) {
      return;
    }

    const checkForShareIntent = () => {
      try {
        const hasIntent = AndroidShareIntent.hasShareIntent();
        if (hasIntent) {
          const data = AndroidShareIntent.getShareIntent();
          console.log("[AndroidShareIntent] Found share intent data:", data);
          setShareIntent(data);
          setHasShareIntent(true);
        }
      } catch (err) {
        console.error("[AndroidShareIntent] Error checking share intent:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    // Check immediately
    checkForShareIntent();

    // Set up interval to check for new intents
    // This handles the case where onNewIntent fires while JS is loading
    const intervalId = setInterval(checkForShareIntent, 100);

    // Clean up after 2 seconds (should be enough for JS to be ready)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const resetShareIntent = useCallback(() => {
    if (Platform.OS === "android" && AndroidShareIntent) {
      try {
        console.log("[AndroidShareIntent] Resetting share intent");
        AndroidShareIntent.resetShareIntent();
        setHasShareIntent(false);
        setShareIntent({});
        setError(null);
      } catch (err) {
        console.error("[AndroidShareIntent] Error resetting share intent:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  }, []);

  return {
    hasShareIntent,
    shareIntent,
    resetShareIntent,
    error,
  };
}
