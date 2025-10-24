import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  streak: number;
  maxStreak: number;
  todayDate: string;
  onSettingsClick: () => void;
  onStatsClick: () => void;
  onHelpClick: () => void;
}

export function Header({ streak, maxStreak, todayDate, onSettingsClick, onStatsClick, onHelpClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-2xl mx-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={onHelpClick}
          data-testid="button-help"
          className="w-10 h-10"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-title">
            WORDCAST
          </h1>
          <p className="text-xs text-muted-foreground" data-testid="text-date">
            {todayDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          
          <Button
            size="icon"
            variant="ghost"
            onClick={onSettingsClick}
            data-testid="button-settings"
            className="w-10 h-10"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
