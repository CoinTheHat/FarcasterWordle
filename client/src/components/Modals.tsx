import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, TrendingUp, Trophy, Flame, Loader2 } from "lucide-react";

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  attempts: number;
  solution: string;
  streak: number;
  maxStreak: number;
  totalScore?: number;
  walletConnected?: boolean;
  isSavingScore?: boolean;
  gameCompleted?: boolean;
  onShare: () => void;
  onSaveScore?: () => void;
}

export function GameOverModal({
  isOpen,
  onClose,
  won,
  attempts,
  solution,
  streak,
  maxStreak,
  totalScore = 0,
  walletConnected = false,
  isSavingScore = false,
  gameCompleted = false,
  onShare,
  onSaveScore,
}: GameOverModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-gameover">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {won ? "🎉 Congratulations!" : "😔 Game Over"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {won
              ? `You solved it in ${attempts} ${attempts === 1 ? "try" : "tries"}!`
              : "Better luck tomorrow!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!won && solution && (
            <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">The word was:</p>
              <p className="text-3xl font-bold tracking-widest text-primary" data-testid="text-solution">
                {solution.toUpperCase()}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">Streak</span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-current-streak">
                {streak}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">Score</span>
              </div>
              <div className="text-3xl font-bold text-primary" data-testid="text-total-score">
                {totalScore}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">Tries</span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-attempts">
                {won ? attempts : "-"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!gameCompleted && walletConnected && onSaveScore && totalScore > 0 && (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Save to blockchain to count for leaderboards & streaks!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Without saving, you can play again with a new word
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold gap-2"
                  onClick={onSaveScore}
                  disabled={isSavingScore}
                  variant="default"
                  data-testid="button-save-score"
                >
                  {isSavingScore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      Save Score to Blockchain
                    </>
                  )}
                </Button>
              </>
            )}

            <Button
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={onShare}
              variant={gameCompleted ? "default" : "outline"}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
              Share Result
            </Button>

            {gameCompleted && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✅ Score saved to blockchain! Come back tomorrow for a new word.
                </p>
              </div>
            )}
          </div>

          {!won && (
            <p className="text-sm text-center text-muted-foreground">
              Come back tomorrow for a new word!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  maxStreak: number;
  lastPlayed: string | null;
}

export function StatsModal({ isOpen, onClose, streak, maxStreak, lastPlayed }: StatsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-stats">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Statistics</DialogTitle>
          <DialogDescription>Your WordCast performance</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <Flame className="w-6 h-6 text-primary" />
              <div className="text-3xl font-bold" data-testid="stats-current-streak">
                {streak}
              </div>
              <div className="text-xs uppercase font-medium text-muted-foreground">
                Current Streak
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <Trophy className="w-6 h-6 text-primary" />
              <div className="text-3xl font-bold" data-testid="stats-max-streak">
                {maxStreak}
              </div>
              <div className="text-xs uppercase font-medium text-muted-foreground">
                Max Streak
              </div>
            </div>
          </div>

          {lastPlayed && (
            <div className="text-center text-sm text-muted-foreground">
              Last played: {lastPlayed}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorBlindMode: boolean;
  onColorBlindToggle: (enabled: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  colorBlindMode,
  onColorBlindToggle,
}: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
          <DialogDescription>Customize your experience</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Color Blind Mode</span>
              <span className="text-sm text-muted-foreground">
                Add patterns to tiles for better visibility
              </span>
            </div>
            <Button
              variant={colorBlindMode ? "default" : "outline"}
              size="sm"
              onClick={() => onColorBlindToggle(!colorBlindMode)}
              data-testid="toggle-colorblind"
            >
              {colorBlindMode ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-help">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">How to Play</DialogTitle>
          <DialogDescription>Guess the word in 6 tries</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          <p>Each guess must be a valid 5-letter word. After each guess, the color of the tiles will change to show how close your guess was to the word.</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-bold">
                W
              </div>
              <p>
                <strong>Green</strong> means the letter is correct and in the right position
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[hsl(48_96%_53%)] flex items-center justify-center font-bold">
                O
              </div>
              <p>
                <strong>Yellow</strong> means the letter is in the word but in the wrong position
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center text-muted-foreground font-bold">
                R
              </div>
              <p>
                <strong>Gray</strong> means the letter is not in the word
              </p>
            </div>
          </div>

          <p className="text-muted-foreground pt-2">
            A new word is available every day at midnight Istanbul time (UTC+3). Keep your streak going!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
