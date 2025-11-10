import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, HelpCircle, Lightbulb, Trophy, Wallet, Home, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import type { Language } from "@shared/schema";

interface HeaderProps {
  streak?: number;
  maxStreak?: number;
  todayDate?: string;
  totalScore?: number;
  showScore?: boolean;
  walletConnected?: boolean;
  walletAddress?: string;
  currentLanguage?: Language;
  onSettingsClick?: () => void;
  onStatsClick?: () => void;
  onHelpClick?: () => void;
  onHintClick?: () => void;
  onLanguageClick?: () => void;
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
  currentLanguage,
  onSettingsClick, 
  onStatsClick, 
  onHelpClick, 
  onHintClick, 
  onLanguageClick,
  hintUsed = false 
}: HeaderProps) {
  const [location] = useLocation();
  const isLeaderboard = location === "/leaderboard";
  const isGame = location === "/";
  const { t, language, setLanguage } = useTranslation();
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleLanguage = () => {
    const newLang: Language = language === "en" ? "tr" : "en";
    setLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-2 md:px-4 max-w-2xl mx-auto gap-1 md:gap-2">
        <div className="flex items-center gap-0.5 md:gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
            className="h-8 w-8 md:h-10 md:w-auto md:px-3 md:gap-1.5"
          >
            <Globe className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline font-semibold">{language.toUpperCase()}</span>
          </Button>
          
          {isGame && onHelpClick && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={onHelpClick}
                data-testid="button-help"
                className="h-8 w-8 md:w-10 md:h-10"
              >
                <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={onHintClick}
                data-testid="button-hint"
                className="h-8 w-8 md:w-10 md:h-10"
                disabled={hintUsed}
              >
                <Lightbulb className={`w-4 h-4 md:w-5 md:h-5 ${hintUsed ? 'text-yellow-500' : ''}`} />
              </Button>
            </>
          )}
          
          {!isGame && (
            <Link href="/">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-back-home"
                className="h-8 w-8 md:w-10 md:h-10"
              >
                <Home className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center flex-1 min-w-0">
          <Link href="/">
            <h1 className="text-lg md:text-2xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors whitespace-nowrap" data-testid="text-title">
              {t.headerTitle}
            </h1>
          </Link>
          {todayDate && (
            <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
              <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap" data-testid="text-date">
                {todayDate}
              </p>
              {showScore && totalScore > 0 && (
                <>
                  <span className="text-[10px] md:text-xs text-muted-foreground">•</span>
                  <p className="text-[10px] md:text-xs font-semibold text-primary whitespace-nowrap" data-testid="text-score">
                    {totalScore} {t.headerPoints}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 md:gap-2">
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
              className="h-8 w-8 md:w-10 md:h-10"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </Link>
          
          {isGame && onStatsClick && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onStatsClick}
              data-testid="button-stats"
              className="h-8 w-8 md:w-10 md:h-10 relative"
            >
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
              {streak > 0 && (
                <Badge
                  className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs"
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
              className="h-8 w-8 md:w-10 md:h-10"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
