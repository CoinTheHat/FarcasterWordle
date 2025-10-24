import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuardScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold" data-testid="text-guard-title">
            Farcaster Mini-App Required
          </h1>
          <p className="text-muted-foreground" data-testid="text-guard-message">
            This game can only be played inside the Farcaster Mini-App. Please open it from your Farcaster client.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            To play WordCast:
          </p>
          <ol className="text-sm text-left space-y-2 pl-6 list-decimal text-muted-foreground">
            <li>Open the Farcaster mobile or desktop app</li>
            <li>Navigate to the WordCast Mini-App</li>
            <li>Start playing and track your streak!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
