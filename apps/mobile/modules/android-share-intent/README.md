# Android Share Intent Module

This is a custom Expo module that handles Android share intents for the Karakeep mobile app.

## Why This Module?

This module was created to replace `expo-share-intent` for Android due to reliability issues with share intents, particularly on cold starts. The main problems were:
- Links not being added when the app was not already running
- Links being added multiple times
- Race conditions between native and JS layers

## How It Works

### Native Layer (Kotlin)

The `AndroidShareIntentModule.kt` handles:
1. **Intent Detection**: Listens for `ACTION_SEND` intents with supported MIME types
2. **Data Storage**: Stores intent data in memory until JS retrieves it
3. **Lifecycle Management**: Handles both cold starts (onCreate) and warm starts (onNewIntent)

### JavaScript Layer

The `useAndroidShareIntent.ts` hook:
1. Polls for intent data when the component mounts
2. Provides the data to the app
3. Allows explicit cleanup via `resetShareIntent()`

### Integration

The `lib/shareIntent.ts` wrapper:
- Uses the custom module for Android
- Uses `expo-share-intent` for iOS
- Provides a unified API for both platforms

## Supported Intent Types

- **Text/URLs**: `text/plain` - Plain text and URLs shared from other apps
- **Images**: `image/*` - Image files shared from gallery or other apps
- **PDFs**: `application/pdf` - PDF documents shared from file managers

## Configuration

The module is configured via the `plugins/android-share-intent.js` Expo config plugin, which:
- Adds intent filters to AndroidManifest.xml
- Sets the MainActivity launch mode to `singleTask`
- Modifies MainActivity to handle intents properly

## Usage

```typescript
import { useShareIntent } from "@/lib/shareIntent";

function MyComponent() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent) {
      // Process the shared data
      console.log(shareIntent);
      
      // When done, reset the intent
      resetShareIntent();
    }
  }, [hasShareIntent]);

  // ...
}
```

## Development

To rebuild the Android app with this module:

```bash
# Clean prebuild
pnpm --filter mobile clean:prebuild

# Run Android
pnpm --filter mobile android
```

## Testing

Test scenarios to verify:
1. **Cold Start**: Share a link when the app is not running
2. **Warm Start**: Share a link when the app is in the background
3. **Multiple Shares**: Share multiple links in quick succession
4. **Different Types**: Test text, URLs, images, and PDFs

## Troubleshooting

If share intents are not working:
1. Check logcat for `[AndroidShareIntent]` logs
2. Verify the module is properly compiled
3. Ensure prebuild was run after changes
4. Check that the intent filters are in AndroidManifest.xml
