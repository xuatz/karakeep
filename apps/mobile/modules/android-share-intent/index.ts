export interface ShareIntentFile {
  path: string;
  mimeType: string;
  fileName?: string;
}

export interface ShareIntentData {
  text?: string;
  webUrl?: string;
  files?: ShareIntentFile[];
}

export interface AndroidShareIntentModule {
  hasShareIntent(): boolean;
  getShareIntent(): ShareIntentData;
  resetShareIntent(): void;
}
