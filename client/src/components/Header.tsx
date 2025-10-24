import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, HelpCircle, Lightbulb, Trophy, Wallet, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  streak?: number;
  maxStreak?: number;
  todayDate?: string;
  totalScore?: number;
  showScore?: boolean;
  walletConnected?: boolean;
  walletAddress?: string;
  burnerBalance?: string;
  onSettingsClick?: () => void;
  onStatsClick?: () => void;
  onHelpClick?: () => void;
  onHintClick?: () => void;
  hintUsed?: boolean;
}

export function Header({ 
  streak = 0, 
  maxStreak = 0, 
  todayDate = "", 
  totalScore = 0, 
  showScore = true,
  walletConnected = false,
  walletAddress,
  burnerBalance,
  onSettingsClick, 
  onStatsClick, 
  onHelpClick, 
  onHintClick, 
  hintUsed = false 
}: HeaderProps) {
  const [location] = useLocation();
  const isLeaderboard = location === "/leaderboard";
  const isGame = location === "/";
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          {isGame && onHelpClick && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={onHelpClick}
                data-testid="button-help"
                className="w-10 h-10"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={onHintClick}
                data-testid="button-hint"
                className="w-10 h-10"
                disabled={hintUsed}
              >
                <Lightbulb className={`w-5 h-5 ${hintUsed ? 'text-yellow-500' : ''}`} />
              </Button>
            </>
          )}
          
          {!isGame && (
            <Link href="/">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-back-home"
                className="w-10 h-10"
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors" data-testid="text-title">
              WORDCAST
            </h1>
          </Link>
          {todayDate && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <p className="text-xs text-muted-foreground" data-testid="text-date">
                {todayDate}
              </p>
              {showScore && totalScore > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs font-semibold text-primary" data-testid="text-score">
                    {totalScore} pts
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {burnerBalance && parseFloat(burnerBalance) > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs" data-testid="badge-burner">
              ⚡ {parseFloat(burnerBalance).toFixed(4)} ETH
            </Badge>
          )}
          
          {walletConnected && walletAddress && (
            <Badge variant="secondary" className="hidden md:flex items-center gap-1" data-testid="badge-wallet">
              <Wallet className="w-3 h-3" />
              {formatAddress(walletAddress)}
            </Badge>
          )}
          
          <Link href="/leaderboard">
            <Button
              size="icon"
              variant={isLeaderboard ? "default" : "ghost"}
              data-testid="button-leaderboard"
              className="w-10 h-10"
            >
              <Trophy className="w-5 h-5" />
            </Button>
          </Link>
          
          {isGame && onStatsClick && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onStatsClick}
              data-testid="button-stats"
              className="w-10 h-10 relative"
            >
              <TrendingUp className="w-5 h-5" />
              {streak > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-streak"
                >
                  {streak}
                </Badge>
              )}
            </Button>
          )}
          
          {isGame && onSettingsClick && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onSettingsClick}
              data-testid="button-settings"
              className="w-10 h-10"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
