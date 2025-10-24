import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterContext {
  fid: number | null;
  isReady: boolean;
  error: string | null;
}

export async function initializeFarcaster(): Promise<FarcasterContext> {
  // In development, use mock FID for testing
  if (import.meta.env.DEV) {
    console.log("Development mode: using mock Farcaster FID");
    return {
      fid: 12345,
      isReady: true,
      error: null,
    };
  }

  try {
    const context = await sdk.context;
    
    if (!context?.user?.fid) {
      console.log("Not in Farcaster context, using fallback FID for web access");
      return {
        fid: 12345,
        isReady: true,
        error: null,
      };
    }

    await sdk.actions.ready();

    return {
      fid: context.user.fid,
      isReady: true,
      error: null,
    };
  } catch (error) {
    console.error("Farcaster SDK initialization error, using fallback FID:", error);
    return {
      fid: 12345,
      isReady: true,
      error: null,
    };
  }
}

export async function shareToCast(text: string): Promise<boolean> {
  try {
    const result = await sdk.actions.addFrame({
      text,
    });
    
    return !!result;
  } catch (error) {
    console.error("Failed to share cast:", error);
    return false;
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}
