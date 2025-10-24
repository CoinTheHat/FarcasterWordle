import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterContext {
  fid: number | null;
  isReady: boolean;
  error: string | null;
}

export async function initializeFarcaster(): Promise<FarcasterContext> {
  // In development, use real FID from env or mock FID for testing
  if (import.meta.env.DEV) {
    const devFid = import.meta.env.VITE_DEV_FID 
      ? parseInt(import.meta.env.VITE_DEV_FID, 10) 
      : 12345;
    console.log("Development mode: using FID", devFid);
    return {
      fid: devFid,
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
    const encodedText = encodeURIComponent(text);
    const composeUrl = `https://warpcast.com/~/compose?text=${encodedText}`;
    
    if (import.meta.env.DEV) {
      window.open(composeUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
    
    try {
      await sdk.actions.openUrl(composeUrl);
      return true;
    } catch (sdkError) {
      console.log("SDK openUrl failed, using window.open:", sdkError);
      window.open(composeUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
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
