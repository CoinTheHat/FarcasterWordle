import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame, Wallet } from "lucide-react";
import type { LeaderboardResponse } from "@shared/schema";

export default function Leaderboard() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "best-scores">("daily");

  const { data: leaderboardData, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ["/api/leaderboard", period],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${period}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const { data: lastWeekWinners } = useQuery<LeaderboardResponse>({
    queryKey: ["/api/leaderboard/last-week-winners"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard/last-week-winners");
      if (!response.ok) throw new Error("Failed to fetch last week winners");
      return response.json();
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">1st</Badge>;
    if (rank === 2) return <Badge variant="secondary">2nd</Badge>;
    if (rank === 3) return <Badge variant="secondary">3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showScore={false} />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-leaderboard-title">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            See how you rank against other players
          </p>
        </div>

        {lastWeekWinners?.leaderboard && lastWeekWinners.leaderboard.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Last Week's Winners
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Top 3 players from previous week
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lastWeekWinners.leaderboard.map((entry) => (
                <div
                  key={`last-week-${entry.fid}-${entry.rank}`}
                  className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-background/50 border"
                  data-testid={`last-week-winner-${entry.rank}`}
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(entry.rank)}
                      {getRankBadge(entry.rank)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base truncate">
                        {entry.username || `Player ${entry.fid}`}
                      </div>
                      {entry.walletAddress ? (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Wallet className="w-3 h-3" />
                          <span className="font-mono truncate" data-testid={`last-week-wallet-${entry.rank}`}>
                            {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                          </span>
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-yellow-500 hover:bg-yellow-600">
                            Prize Winner
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">
                          No wallet connected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="text-lg md:text-xl font-bold text-yellow-600 dark:text-yellow-500">
                      {entry.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      points
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs value={period} onValueChange={(v) => setPeriod(v as "daily" | "weekly" | "best-scores")} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily" data-testid="tab-daily">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="best-scores" data-testid="tab-best-scores">
              Best Scores
            </TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            ) : leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leaderboardData.leaderboard.map((entry) => (
                    <div
                      key={`${entry.fid}-${entry.rank}`}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg hover-elevate border"
                      data-testid={`leaderboard-entry-${entry.rank}`}
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-[60px] md:min-w-[80px]">
                          {getRankIcon(entry.rank)}
                          {getRankBadge(entry.rank)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base truncate" data-testid={`text-username-${entry.rank}`}>
                            {entry.username || `Player ${entry.fid}`}
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {period === "best-scores" ? "Best Score" : entry.won > 0 ? `${entry.won} win${entry.won > 1 ? 's' : ''}` : 'No wins'}
                            {period === "daily" && ` • ${entry.attempts} attempt${entry.attempts > 1 ? 's' : ''}`}
                          </div>
                          {period === "weekly" && entry.rank <= 3 && entry.walletAddress && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                              <Wallet className="w-3 h-3" />
                              <span className="font-mono truncate" data-testid={`text-wallet-${entry.rank}`}>
                                {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
                              </span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Prize
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xl md:text-2xl font-bold text-primary" data-testid={`text-score-${entry.rank}`}>
                          {entry.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scores yet. Be the first to play!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
