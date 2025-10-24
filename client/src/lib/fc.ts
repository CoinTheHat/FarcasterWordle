import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterContext {
  fid: number | null;
  isReady: boolean;
  error: string | null;
}

export async function initializeFarcaster(): Promise<FarcasterContext> {
  try {
    const context = await sdk.context;
    
    if (!context?.user?.fid) {
      return {
        fid: null,
        isReady: false,
        error: "No Farcaster user found",
      };
    }

    await sdk.actions.ready();

    return {
      fid: context.user.fid,
      isReady: true,
      error: null,
    };
  } catch (error) {
    console.error("Farcaster SDK initialization error:", error);
    return {
      fid: null,
      isReady: false,
      error: error instanceof Error ? error.message : "Failed to initialize",
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
