import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { Board } from "@/components/Board";
import { Keyboard } from "@/components/Keyboard";
import { GameOverModal, StatsModal, SettingsModal, HelpModal } from "@/components/Modals";
import { GuardScreen } from "@/components/GuardScreen";
import { initializeFarcaster, shareToCast, copyToClipboard } from "@/lib/fc";
import { submitGuess, fetchUserStats, setFid as setApiFid, fetchHint } from "@/lib/api";
import { getFormattedDate } from "@/lib/date";
import { normalizeGuess, isValidGuess } from "@/lib/words";
import type { TileFeedback, GameStatus, UserStats } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Game() {
  const [fid, setFid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState<TileFeedback[][]>([]);
  const [letterStates, setLetterStates] = useState<Map<string, TileFeedback>>(new Map());
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [solution, setSolution] = useState("");
  const [revealingRow, setRevealingRow] = useState<number | undefined>();
  
  const [showGameOver, setShowGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(() => {
    return localStorage.getItem("colorBlindMode") === "true";
  });
  const [hintUsed, setHintUsed] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      const fcContext = await initializeFarcaster();
      
      if (!fcContext.fid) {
        setError(fcContext.error || "Not in Farcaster");
        setIsLoading(false);
        return;
      }

      setFid(fcContext.fid);
      setApiFid(fcContext.fid);
      
      try {
        const userStats = await fetchUserStats();
        setStats(userStats);
        
        if (userStats.remainingAttempts === 0) {
          setGameStatus("lost");
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load game data");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const updateLetterStates = useCallback((guess: string, fb: TileFeedback[]) => {
    setLetterStates((prev) => {
      const newStates = new Map(prev);
      
      guess.split("").forEach((letter, i) => {
        const currentState = newStates.get(letter);
        const newState = fb[i];
        
        if (newState === "correct") {
          newStates.set(letter, "correct");
        } else if (newState === "present" && currentState !== "correct") {
          newStates.set(letter, "present");
        } else if (!currentState) {
          newStates.set(letter, newState);
        }
      });
      
      return newStates;
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== "playing" || currentGuess.length >= 5) return;
    setCurrentGuess((prev) => prev + key);
  }, [gameStatus, currentGuess]);

  const handleDelete = useCallback(() => {
    if (gameStatus !== "playing") return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameStatus]);

  const handleEnter = useCallback(async () => {
    if (gameStatus !== "playing" || currentGuess.length !== 5) {
      if (currentGuess.length > 0 && currentGuess.length < 5) {
        toast({
          title: "Not enough letters",
          description: "Please enter a 5-letter word",
          variant: "destructive",
        });
      }
      return;
    }

    const normalized = normalizeGuess(currentGuess);
    
    if (!isValidGuess(normalized)) {
      toast({
        title: "Not in word list",
        description: "Please try a different word",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await submitGuess(normalized);
      
      const newGuesses = [...guesses, normalized];
      const newFeedback = [...feedback, response.feedback];
      
      setGuesses(newGuesses);
      setFeedback(newFeedback);
      setCurrentGuess("");
      
      const rowIndex = newGuesses.length - 1;
      setRevealingRow(rowIndex);
      
      setTimeout(() => {
        setRevealingRow(undefined);
        updateLetterStates(normalized, response.feedback);
      }, 600);

      if (response.won) {
        setGameStatus("won");
        setSolution(normalized);
        setTimeout(() => {
          setShowGameOver(true);
          if (stats) {
            setStats({
              ...stats,
              streak: stats.streak + 1,
              maxStreak: Math.max(stats.maxStreak, stats.streak + 1),
              remainingAttempts: response.remainingAttempts,
            });
          }
        }, 1000);
      } else if (response.gameOver) {
        setGameStatus("lost");
        setSolution(response.solution || "");
        setTimeout(() => {
          setShowGameOver(true);
          if (stats) {
            setStats({
              ...stats,
              streak: 0,
              remainingAttempts: response.remainingAttempts,
            });
          }
        }, 1000);
      } else if (stats) {
        setStats({
          ...stats,
          remainingAttempts: response.remainingAttempts,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit guess",
        variant: "destructive",
      });
    }
  }, [gameStatus, currentGuess, guesses, feedback, stats, toast, updateLetterStates]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      if (showGameOver || showStats || showSettings || showHelp) return;

      if (e.key === "Enter") {
        handleEnter();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleEnter, showGameOver, showStats, showSettings, showHelp]);

  const handleShare = async () => {
    if (!stats) return;

    const attempts = guesses.length;
    const emoji = gameStatus === "won" ? "✅" : "❌";
    const text = `WordCast ${stats.today}\n${emoji} ${gameStatus === "won" ? `${attempts}/6` : "X/6"}\n🔥 Streak: ${stats.streak}\n\nPlay daily on Farcaster!`;

    const shared = await shareToCast(text);
    
    if (!shared) {
      const copied = await copyToClipboard(text);
      toast({
        title: copied ? "Copied to clipboard!" : "Failed to copy",
        description: copied ? "Share your results!" : "Try again",
        variant: copied ? "default" : "destructive",
      });
    } else {
      toast({
        title: "Shared to Farcaster!",
        description: "Your results have been posted",
      });
    }
  };

  const handleColorBlindToggle = (enabled: boolean) => {
    setColorBlindMode(enabled);
    localStorage.setItem("colorBlindMode", enabled.toString());
  };

  const handleHintClick = async () => {
    if (hintUsed || gameStatus !== "playing") return;
    
    try {
      const hintData = await fetchHint();
      setHintUsed(true);
      
      toast({
        title: "💡 Hint Revealed!",
        description: `Position ${hintData.position + 1}: Letter "${hintData.letter}"`,
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Failed to get hint",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading WordCast...</p>
      </div>
    );
  }

  if (error || !fid) {
    return <GuardScreen />;
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-destructive">Failed to load game data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <Header
        streak={stats.streak}
        maxStreak={stats.maxStreak}
        todayDate={getFormattedDate()}
        onSettingsClick={() => setShowSettings(true)}
        onStatsClick={() => setShowStats(true)}
        onHelpClick={() => setShowHelp(true)}
        onHintClick={handleHintClick}
        hintUsed={hintUsed}
      />

      <main className="flex-1 flex flex-col items-center justify-between py-8 px-4">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          {/* Stats Badge */}
          <div className="grid grid-cols-3 gap-4 mb-8 px-4">
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-3xl font-bold text-primary" data-testid="stat-streak">{stats.streak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-3xl font-bold text-primary" data-testid="stat-max-streak">{stats.maxStreak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Max Streak</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-3xl font-bold text-primary" data-testid="stat-remaining">{stats.remainingAttempts}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</div>
            </div>
          </div>
          
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            feedback={feedback}
            colorBlindMode={colorBlindMode}
            revealingRow={revealingRow}
          />
        </div>

        <div className="w-full max-w-2xl">
          <Keyboard
            onKeyPress={handleKeyPress}
            onEnter={handleEnter}
            onDelete={handleDelete}
            letterStates={letterStates}
            colorBlindMode={colorBlindMode}
            disabled={gameStatus !== "playing"}
          />
        </div>
      </main>

      <GameOverModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        won={gameStatus === "won"}
        attempts={guesses.length}
        solution={solution}
        streak={stats.streak}
        maxStreak={stats.maxStreak}
        onShare={handleShare}
      />

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        streak={stats.streak}
        maxStreak={stats.maxStreak}
        lastPlayed={stats.lastPlayed}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        colorBlindMode={colorBlindMode}
        onColorBlindToggle={handleColorBlindToggle}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}
