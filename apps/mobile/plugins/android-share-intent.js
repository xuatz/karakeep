const {
  withAndroidManifest,
  withMainActivity,
  AndroidConfig,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Custom Android share intent plugin to replace expo-share-intent
 * This provides more control over intent handling to fix reliability issues
 */

/**
 * Modify AndroidManifest.xml to add intent filters for sharing
 */
function withShareIntentManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    // Find the main activity
    const mainActivity = mainApplication.activity?.find(
      (activity) =>
        activity.$?.["android:name"] === ".MainActivity" ||
        activity["intent-filter"]?.some((filter) =>
          filter.action?.some(
            (action) =>
              action.$?.["android:name"] === "android.intent.action.MAIN",
          ),
        ),
    );

    if (!mainActivity) {
      throw new Error("Could not find MainActivity in AndroidManifest.xml");
    }

    // Set launch mode to singleTask to prevent multiple instances
    mainActivity.$["android:launchMode"] = "singleTask";

    // Ensure intent-filter array exists
    if (!mainActivity["intent-filter"]) {
      mainActivity["intent-filter"] = [];
    }

    // Add intent filter for ACTION_SEND (single item)
    const sendIntentFilter = {
      action: [
        {
          $: {
            "android:name": "android.intent.action.SEND",
          },
        },
      ],
      category: [
        {
          $: {
            "android:name": "android.intent.category.DEFAULT",
          },
        },
      ],
      data: [
        {
          $: {
            "android:mimeType": "text/plain",
          },
        },
      ],
    };

    // Add intent filter for ACTION_SEND with images
    const sendImageIntentFilter = {
      action: [
        {
          $: {
            "android:name": "android.intent.action.SEND",
          },
        },
      ],
      category: [
        {
          $: {
            "android:name": "android.intent.category.DEFAULT",
          },
        },
      ],
      data: [
        {
          $: {
            "android:mimeType": "image/*",
          },
        },
      ],
    };

    // Add intent filter for ACTION_SEND with PDFs
    const sendPdfIntentFilter = {
      action: [
        {
          $: {
            "android:name": "android.intent.action.SEND",
          },
        },
      ],
      category: [
        {
          $: {
            "android:name": "android.intent.category.DEFAULT",
          },
        },
      ],
      data: [
        {
          $: {
            "android:mimeType": "application/pdf",
          },
        },
      ],
    };

    // Check if intent filters already exist to avoid duplicates
    const hasTextFilter = mainActivity["intent-filter"].some(
      (filter) =>
        filter.action?.some(
          (action) =>
            action.$?.["android:name"] === "android.intent.action.SEND",
        ) &&
        filter.data?.some(
          (data) => data.$?.["android:mimeType"] === "text/plain",
        ),
    );

    const hasImageFilter = mainActivity["intent-filter"].some(
      (filter) =>
        filter.action?.some(
          (action) =>
            action.$?.["android:name"] === "android.intent.action.SEND",
        ) &&
        filter.data?.some((data) => data.$?.["android:mimeType"] === "image/*"),
    );

    const hasPdfFilter = mainActivity["intent-filter"].some(
      (filter) =>
        filter.action?.some(
          (action) =>
            action.$?.["android:name"] === "android.intent.action.SEND",
        ) &&
        filter.data?.some(
          (data) => data.$?.["android:mimeType"] === "application/pdf",
        ),
    );

    if (!hasTextFilter) {
      mainActivity["intent-filter"].push(sendIntentFilter);
    }

    if (!hasImageFilter) {
      mainActivity["intent-filter"].push(sendImageIntentFilter);
    }

    if (!hasPdfFilter) {
      mainActivity["intent-filter"].push(sendPdfIntentFilter);
    }

    return config;
  });
}

/**
 * Create a custom MainActivity to handle share intents
 */
function withCustomMainActivity(config) {
  return withMainActivity(config, async (config) => {
    const { language, contents } = config.modResults;

    if (language === "java") {
      // Modify Java MainActivity
      let newContents = contents;

      // Add imports if not present
      if (!newContents.includes("import android.content.Intent;")) {
        newContents = newContents.replace(
          "package app.hoarder.hoardermobile;",
          `package app.hoarder.hoardermobile;

import android.content.Intent;
import android.os.Bundle;`,
        );
      }

      // Add onCreate and onNewIntent methods if not present
      if (!newContents.includes("protected void onCreate")) {
        const createMethods = `
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handleIntent(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleIntent(intent);
  }

  private void handleIntent(Intent intent) {
    String action = intent.getAction();
    String type = intent.getType();

    if (Intent.ACTION_SEND.equals(action) && type != null) {
      // Store intent data for JS to retrieve
      // This will be handled by the ShareIntentModule
    }
  }
`;
        // Insert before the last closing brace
        newContents = newContents.replace(/}\s*$/, createMethods + "\n}");
      }

      config.modResults.contents = newContents;
    } else if (language === "kt" || language === "kotlin") {
      // Modify Kotlin MainActivity
      let newContents = contents;

      // Add imports if not present
      if (!newContents.includes("import android.content.Intent")) {
        newContents = newContents.replace(
          "package app.hoarder.hoardermobile",
          `package app.hoarder.hoardermobile

import android.content.Intent
import android.os.Bundle`,
        );
      }

      // Add onCreate and onNewIntent methods if not present
      if (!newContents.includes("override fun onCreate")) {
        const createMethods = `
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent) {
    val action = intent.action
    val type = intent.type

    if (Intent.ACTION_SEND == action && type != null) {
      // Store intent data for JS to retrieve
      // This will be handled by the ShareIntentModule
    }
  }
`;
        // Insert before the last closing brace
        newContents = newContents.replace(/}\s*$/, createMethods + "\n}");
      }

      config.modResults.contents = newContents;
    }

    return config;
  });
}

/**
 * Main plugin function
 */
const withAndroidShareIntent = (config) => {
  config = withShareIntentManifest(config);
  config = withCustomMainActivity(config);
  return config;
};

module.exports = withAndroidShareIntent;
