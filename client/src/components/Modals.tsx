import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, TrendingUp, Trophy, Flame, Loader2, Wallet } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

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
  const { t, tf, language } = useTranslation();
  const [showWarning, setShowWarning] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !gameCompleted && walletConnected && totalScore > 0 && !isSavingScore) {
      // User is trying to close modal without saving score
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm" data-testid="modal-gameover">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {won ? t.gameOverCongrats : t.gameOverGameOver}
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-1">
            <div className="text-lg font-semibold text-primary">
              {won ? tf.encouragementMessage(attempts) : t.gameOverBetterLuck}
            </div>
            {won && (
              <div className="text-sm text-muted-foreground">
                {`${t.gameOverSolvedIn} ${attempts} ${attempts === 1 ? t.gameOverTry : t.gameOverTries}`}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!won && solution && (
            <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t.gameOverTheWordWas}</p>
              <p className="text-3xl font-bold tracking-widest text-primary" data-testid="text-solution">
                {solution.toUpperCase()}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">{t.gameOverStreak}</span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-current-streak">
                {streak}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">{t.gameOverScore}</span>
              </div>
              <div className="text-3xl font-bold text-primary" data-testid="text-total-score">
                {totalScore}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase font-medium">{t.gameOverTryCount}</span>
              </div>
              <div className="text-3xl font-bold" data-testid="text-attempts">
                {won ? attempts : "-"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {showWarning && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center animate-pulse">
                <p className="text-sm text-red-600 dark:text-red-400 font-bold">
                  ⚠️ {language === 'tr' ? 'Puan blockchain\'e kaydedilmedi!' : 'Score not saved to blockchain!'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'tr' 
                    ? 'TX onaylamadan modal kapatılamaz. Puanınız haftalık ödüllere sayılmaz!'
                    : 'Cannot close without TX confirmation. Your score won\'t count for weekly rewards!'
                  }
                </p>
              </div>
            )}
            
            {!gameCompleted && walletConnected && onSaveScore && totalScore > 0 && (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {t.gameOverSaveWarning}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.gameOverSaveWarningDesc}
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
                      {t.gameOverSaving}
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      {t.gameOverSaveToBlockchain}
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
              {t.gameOverShareResult}
            </Button>

            {gameCompleted && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {t.gameOverSaved}
                </p>
              </div>
            )}
          </div>

          {!won && (
            <p className="text-sm text-center text-muted-foreground">
              {t.gameOverComeBackTomorrow}
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
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-stats">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.statsTitle}</DialogTitle>
          <DialogDescription>{t.statsDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <Flame className="w-6 h-6 text-primary" />
              <div className="text-3xl font-bold" data-testid="stats-current-streak">
                {streak}
              </div>
              <div className="text-xs uppercase font-medium text-muted-foreground">
                {t.statsCurrentStreak}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted">
              <Trophy className="w-6 h-6 text-primary" />
              <div className="text-3xl font-bold" data-testid="stats-max-streak">
                {maxStreak}
              </div>
              <div className="text-xs uppercase font-medium text-muted-foreground">
                {t.statsMaxStreak}
              </div>
            </div>
          </div>

          {lastPlayed && (
            <div className="text-center text-sm text-muted-foreground">
              {t.statsLastPlayed} {lastPlayed}
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
  currentUsername: string | null;
  onUsernameUpdate: (username: string) => Promise<void>;
  currentWalletAddress?: string | null;
  onWalletConnect?: () => void;
  isConnectingWallet?: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  colorBlindMode,
  onColorBlindToggle,
  currentUsername,
  onUsernameUpdate,
  currentWalletAddress,
  onWalletConnect,
  isConnectingWallet = false,
}: SettingsModalProps) {
  const { t, language } = useTranslation();
  const [username, setUsername] = useState(currentUsername || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setUsername(currentUsername || "");
    setError(null);
    setSuccess(false);
  }, [currentUsername, isOpen, language]);

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setError(t.settingsUsernameEmpty);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onUsernameUpdate(username.trim());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t.settingsUsernameFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.settingsTitle}</DialogTitle>
          <DialogDescription>{t.settingsDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t.settingsUsername}</span>
              <span className="text-sm text-muted-foreground">
                {t.settingsUsernameDesc}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.settingsUsernamePlaceholder}
                maxLength={20}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                data-testid="input-username"
              />
              <Button
                onClick={handleSaveUsername}
                disabled={isSaving || !username.trim()}
                size="sm"
                data-testid="button-save-username"
              >
                {isSaving ? t.settingsUsernameUpdating : t.settingsUsernameButton}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-500" data-testid="text-username-error">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400" data-testid="text-username-success">
                {t.settingsUsernameSuccess}
              </p>
            )}
          </div>

          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t.settingsWallet}</span>
              <span className="text-sm text-muted-foreground">
                {t.settingsWalletDesc}
              </span>
            </div>
            {currentWalletAddress ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono flex-1 truncate" data-testid="text-wallet-address">
                    {currentWalletAddress.slice(0, 6)}...{currentWalletAddress.slice(-4)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {t.settingsWalletConnected.replace(":", "")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.settingsWalletSaved}
                </p>
              </div>
            ) : (
              <Button
                onClick={onWalletConnect}
                disabled={isConnectingWallet}
                className="w-full gap-2"
                size="sm"
                data-testid="button-connect-wallet"
              >
                {isConnectingWallet ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.settingsWalletConnecting}
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    {t.settingsWalletConnect}
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t.settingsColorBlind}</span>
              <span className="text-sm text-muted-foreground">
                {t.settingsColorBlindDesc}
              </span>
            </div>
            <Button
              variant={colorBlindMode ? "default" : "outline"}
              size="sm"
              onClick={() => onColorBlindToggle(!colorBlindMode)}
              data-testid="toggle-colorblind"
            >
              {colorBlindMode ? t.settingsOn : t.settingsOff}
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
