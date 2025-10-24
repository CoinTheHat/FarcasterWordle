import { useEffect, useState, useCallback, useRef } from "react";
import { useAccount, useConnect, useSendTransaction } from "wagmi";
import { Header } from "@/components/Header";
import { Board } from "@/components/Board";
import { GameOverModal, StatsModal, SettingsModal, HelpModal } from "@/components/Modals";
import { LanguageModal } from "@/components/LanguageModal";
import { initializeFarcaster, shareToCast, copyToClipboard } from "@/lib/fc";
import { startGame, submitGuess, fetchUserStats, setFid as setApiFid, fetchHint, completeGame, updateUsername as apiUpdateUsername } from "@/lib/api";
import { getFormattedDate } from "@/lib/date";
import { normalizeGuess, isValidGuess } from "@/lib/words";
import type { TileFeedback, GameStatus, UserStats, Language } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Game() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendTransactionAsync } = useSendTransaction();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [fid, setFid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("wordcast-language") as Language) || null;
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState<TileFeedback[][]>([]);
  const [letterStates, setLetterStates] = useState<Map<string, TileFeedback>>(new Map());
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [solution, setSolution] = useState("");
  const [revealingRow, setRevealingRow] = useState<number | undefined>();
  const [totalScore, setTotalScore] = useState(0);
  const [lastRoundScore, setLastRoundScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  
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
      
      setFid(fcContext.fid || 12345);
      setApiFid(fcContext.fid || 12345);
      
      try {
        const userStats = await fetchUserStats();
        setStats(userStats);
        
        if (!language) {
          setShowLanguageModal(true);
          setIsLoading(false);
          return;
        }
        
        if (userStats.remainingAttempts === 0) {
          setGameCompleted(true);
        } else {
          const gameSession = await startGame(language);
          setSessionId(gameSession.sessionId);
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load game data");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [language]);

  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, connect]);

  const handleSaveScore = useCallback(async () => {
    if (!sessionId) {
      toast({
        title: "No active game",
        description: "Please start a game first",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsSavingScore(true);
    try {
      console.log("Preparing transaction:", { address, totalScore, sessionId });
      
      // Send 0 ETH to self to create on-chain proof
      // Score is stored in backend database
      const hash = await sendTransactionAsync({
        to: address as `0x${string}`,
        value: BigInt(0),
        chainId: 8453, // Base mainnet
      });

      console.log("Transaction hash:", hash);
      const result = await completeGame(sessionId, hash);

      setGameCompleted(true);
      setStats(prev => prev ? {
        ...prev,
        streak: result.streak,
        maxStreak: result.maxStreak,
        remainingAttempts: 0,
      } : null);

      toast({
        title: "Score saved!",
        description: `Score ${totalScore} recorded on blockchain. Streak: ${result.streak}`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Blockchain save error:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        name: err instanceof Error ? err.name : 'Unknown',
        stack: err instanceof Error ? err.stack : 'No stack',
        raw: err
      });
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isUserRejection = errorMessage.includes("User rejected") || 
         errorMessage.includes("User denied") ||
         errorMessage.includes("rejected") ||
         errorMessage.includes("cancelled") ||
         errorMessage.includes("user rejected");

      if (isUserRejection) {
        toast({
          title: "Transaction cancelled",
          description: "⚠️ Without saving to blockchain, your score won't count for leaderboards or streaks. Starting a new game with a different word!",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Transaction failed",
          description: errorMessage.length > 100 ? "Network error. Please try again." : errorMessage,
          variant: "destructive",
          duration: 4000,
        });
      }

      try {
        const gameSession = await startGame(language!);
        setSessionId(gameSession.sessionId);
        setGuesses([]);
        setFeedback([]);
        setCurrentGuess("");
        setLetterStates(new Map());
        setGameStatus("playing");
        setGameCompleted(false);
        setShowGameOver(false);
        setTotalScore(0);
        setLastRoundScore(0);
        setSolution("");
        setHintUsed(false);
      } catch (restartErr) {
        console.error("Failed to restart game:", restartErr);
        toast({
          title: "Error",
          description: "Failed to start new game. Please refresh the page.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsSavingScore(false);
    }
  }, [sessionId, isConnected, address, totalScore, sendTransactionAsync, toast]);

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameStatus !== "playing") return;
    // Allow A-Z and Turkish characters (Ç, Ğ, İ, Ö, Ş, Ü)
    const value = language === 'tr' 
      ? e.target.value.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ]/g, '').slice(0, 5)
      : e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
    setCurrentGuess(value);
  }, [gameStatus, language]);

  const handleEnter = useCallback(async () => {
    if (gameStatus !== "playing" || currentGuess.length !== 5) {
      if (currentGuess.length > 0 && currentGuess.length < 5) {
        toast({
          title: "Not enough letters",
          description: `Need ${5 - currentGuess.length} more letter${5 - currentGuess.length === 1 ? '' : 's'}`,
          variant: "destructive",
          duration: 2000,
        });
      }
      return;
    }

    if (!sessionId) {
      toast({
        title: "No active game",
        description: "Please refresh the page",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const normalized = normalizeGuess(currentGuess, language || 'en');
    
    if (!isValidGuess(normalized, language || 'en')) {
      toast({
        title: "Invalid word",
        description: language === 'tr' 
          ? "Please enter only letters (A-Z or Turkish characters)" 
          : "Please enter only letters (A-Z)",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      const response = await submitGuess(normalized, sessionId);
      
      const newGuesses = [...guesses, normalized];
      const newFeedback = [...feedback, response.feedback];
      
      setGuesses(newGuesses);
      setFeedback(newFeedback);
      setCurrentGuess("");
      setLastRoundScore(response.roundScore || 0);
      setTotalScore(response.totalScore || 0);
      
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
        }, 1000);
      } else if (response.gameOver) {
        setGameStatus("lost");
        setSolution(response.solution || "");
        setTimeout(() => {
          setShowGameOver(true);
        }, 1000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit guess",
        variant: "destructive",
        duration: 2000,
      });
    }
  }, [gameStatus, currentGuess, sessionId, guesses, feedback, toast, updateLetterStates]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEnter();
    }
  }, [handleEnter]);

  useEffect(() => {
    if (gameStatus === "playing" && !showGameOver && !showStats && !showSettings && !showHelp) {
      inputRef.current?.focus();
    }
  }, [gameStatus, showGameOver, showStats, showSettings, showHelp]);

  const handleShare = async () => {
    if (!stats) return;

    const attempts = guesses.length;
    const emoji = gameStatus === "won" ? "✅" : "❌";
    const text = `WordCast ${stats.today}\n${emoji} ${gameStatus === "won" ? `${attempts}/6` : "X/6"}\n🔥 Streak: ${stats.streak}\n\nPlay daily on Farcaster!`;

    try {
      const shared = await shareToCast(text);
      
      if (!shared) {
        try {
          const copied = await copyToClipboard(text);
          toast({
            title: copied ? "Copied to clipboard!" : "Unable to copy",
            description: copied ? "Share your results!" : "Please copy manually",
            variant: copied ? "default" : "destructive",
            duration: 2000,
          });
        } catch (clipboardErr) {
          console.error("Clipboard error:", clipboardErr);
          toast({
            title: "Unable to copy",
            description: "Please try again",
            variant: "destructive",
            duration: 2000,
          });
        }
      } else {
        toast({
          title: "Shared to Farcaster!",
          description: "Your results have been posted",
          duration: 2000,
        });
      }
    } catch (err) {
      console.error("Share error:", err);
      toast({
        title: "Unable to share",
        description: "Please try again",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleColorBlindToggle = (enabled: boolean) => {
    setColorBlindMode(enabled);
    localStorage.setItem("colorBlindMode", enabled.toString());
  };

  const handleHintClick = async () => {
    if (hintUsed || gameStatus !== "playing" || !sessionId) return;
    
    try {
      const hintData = await fetchHint(sessionId);
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

  const handleLanguageSelect = useCallback((selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    localStorage.setItem("wordcast-language", selectedLanguage);
    setShowLanguageModal(false);
  }, []);

  const handleUsernameUpdate = useCallback(async (username: string) => {
    try {
      await apiUpdateUsername(username);
      const updatedStats = await fetchUserStats();
      setStats(updatedStats);
    } catch (err: any) {
      throw new Error(err.message || "Failed to update username");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
            WordCast
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your daily puzzle...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-card-border rounded-lg p-6 max-w-md text-center">
          <div className="text-destructive text-lg font-semibold mb-2">Error</div>
          <div className="text-muted-foreground">{error}</div>
        </div>
      </div>
    );
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
        totalScore={totalScore}
        walletConnected={isConnected}
        walletAddress={address}
        currentLanguage={language || undefined}
        onSettingsClick={() => setShowSettings(true)}
        onStatsClick={() => setShowStats(true)}
        onHelpClick={() => setShowHelp(true)}
        onHintClick={handleHintClick}
        onLanguageClick={() => setShowLanguageModal(true)}
        hintUsed={hintUsed}
      />

      <main className="flex-1 flex flex-col items-center justify-between py-2 md:py-4 px-4">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-center">
          {/* Wallet Status */}
          {!isConnected && connectors.length > 0 && (
            <div className="mb-2 md:mb-3 mx-4">
              <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-3 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                  <Wallet className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Connecting wallet...</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
                  <div className="bg-primary h-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          
          {isConnected && address && (
            <div className="mb-2 md:mb-3 mx-4">
              <div className="bg-card/80 backdrop-blur-sm border border-green-500/20 rounded-lg p-3 text-center shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-green-600 dark:text-green-400">
                  <Wallet className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Wallet Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats Badge */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-2 md:mb-3 px-4">
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-2 md:p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-xl md:text-3xl font-bold text-primary" data-testid="stat-streak">{stats.streak}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-2 md:p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-xl md:text-3xl font-bold text-primary" data-testid="stat-max-streak">{stats.maxStreak}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Max</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-2 md:p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-xl md:text-3xl font-bold text-amber-500" data-testid="stat-score">{totalScore}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Score</div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-card-border rounded-lg p-2 md:p-4 text-center shadow-lg hover-elevate transition-all">
              <div className="text-xl md:text-3xl font-bold text-primary" data-testid="stat-remaining">{stats.remainingAttempts}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Left</div>
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

        <div className="w-full max-w-2xl px-4 pb-4">
          <div className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              type="text"
              value={currentGuess}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your guess..."
              disabled={gameStatus !== "playing" || gameCompleted}
              maxLength={5}
              className="text-center text-2xl font-bold uppercase tracking-widest h-14"
              data-testid="input-guess"
              autoFocus
            />
            <Button
              onClick={handleEnter}
              disabled={gameStatus !== "playing" || currentGuess.length !== 5 || gameCompleted}
              size="lg"
              className="h-14 px-8"
              data-testid="button-submit"
            >
              Submit
            </Button>
          </div>
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
        totalScore={totalScore}
        walletConnected={isConnected}
        isSavingScore={isSavingScore}
        gameCompleted={gameCompleted}
        onShare={handleShare}
        onSaveScore={handleSaveScore}
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
        currentUsername={stats.username}
        onUsernameUpdate={handleUsernameUpdate}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <LanguageModal
        isOpen={showLanguageModal}
        onSelect={handleLanguageSelect}
      />
    </div>
  );
}
