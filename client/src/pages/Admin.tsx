import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Wallet, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Winner {
  fid: number;
  username: string | null;
  walletAddress: string | null;
  rank: number;
  totalScore: number;
  rewardAmountUsd: number;
  missingWallet: boolean;
}

interface PreviewResult {
  weekStart: string;
  weekEnd: string;
  winners: Winner[];
  missingWallets: Winner[];
  alreadyDistributed: boolean;
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [isDistributing, setIsDistributing] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch when token is valid length (at least 10 chars)
    if (adminToken && adminToken.length > 10) {
      const timeoutId = setTimeout(() => {
        fetchPreview();
        fetchRewardHistory();
      }, 500); // Debounce 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [adminToken]);

  const fetchPreview = async () => {
    if (!adminToken) return;

    setIsLoadingPreview(true);
    try {
      const response = await fetch("/api/admin/preview-weekly-rewards", {
        headers: {
          "x-admin-token": adminToken,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setPreview(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load preview",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load preview",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const fetchBalance = async () => {
    if (!adminToken) {
      toast({
        title: "Error",
        description: "Please enter admin token first",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingBalance(true);
    try {
      const response = await fetch("/api/admin/wallet-balance", {
        headers: {
          "x-admin-token": adminToken,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setUsdcBalance(data.usdcBalance || '0');
        toast({
          title: "Balance Loaded",
          description: `${data.usdcBalance || '0'} USDC`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch balance",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch balance",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const distributeRewards = async () => {
    if (!adminToken) {
      toast({
        title: "Error",
        description: "Please enter admin token first",
        variant: "destructive",
      });
      return;
    }

    if (preview?.alreadyDistributed) {
      toast({
        title: "Error",
        description: "Rewards have already been distributed for this week",
        variant: "destructive",
      });
      return;
    }

    if (preview && preview.winners.length === 0) {
      toast({
        title: "Error",
        description: "No eligible winners to distribute rewards",
        variant: "destructive",
      });
      return;
    }

    setIsDistributing(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/admin/distribute-weekly-rewards", {
        method: "POST",
        headers: {
          "x-admin-token": adminToken,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast({
          title: "Success",
          description: `Distributed rewards to ${data.distributed.length} winners`,
        });
        fetchRewardHistory();
        fetchPreview();
      } else {
        toast({
          title: "Error",
          description: data.error || "Distribution failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Distribution failed",
        variant: "destructive",
      });
    } finally {
      setIsDistributing(false);
    }
  };

  const fetchRewardHistory = async () => {
    if (!adminToken) return;

    try {
      const response = await fetch("/api/admin/weekly-rewards?limit=20", {
        headers: {
          "x-admin-token": adminToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.rewards);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Weekly Rewards Admin</h1>
          <p className="text-muted-foreground">Distribute weekly prizes to top 3 winners</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Authentication</CardTitle>
          <CardDescription>Enter admin secret token to access controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Admin Secret Token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="flex-1"
              data-testid="input-admin-token"
            />
            <Button
              variant="outline"
              onClick={fetchBalance}
              disabled={!adminToken || isLoadingBalance}
              data-testid="button-fetch-balance"
            >
              {isLoadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {usdcBalance !== null ? `${usdcBalance} USDC` : "Check Balance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Distribute Last Week Rewards
          </CardTitle>
          <CardDescription>
            Automatically sends USDC (stablecoin):
            <ul className="list-disc list-inside mt-2">
              <li>1st Place: 10 USDC ($10)</li>
              <li>2nd Place: 5 USDC ($5)</li>
              <li>3rd Place: 3 USDC ($3)</li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPreview && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Week: {preview.weekStart} - {preview.weekEnd}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPreview}
                  disabled={isLoadingPreview}
                  data-testid="button-refresh-preview"
                >
                  {isLoadingPreview ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>

              {preview.alreadyDistributed && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Rewards have already been distributed for this week
                  </AlertDescription>
                </Alert>
              )}

              {preview.missingWallets.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {preview.missingWallets.length} winner(s) missing wallet address
                  </AlertDescription>
                </Alert>
              )}

              {preview.winners.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Username / FID</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead className="text-right">Reward</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.winners.map((winner) => (
                        <TableRow key={winner.fid}>
                          <TableCell>#{winner.rank}</TableCell>
                          <TableCell>
                            {winner.username || `FID: ${winner.fid}`}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {winner.walletAddress 
                              ? `${winner.walletAddress.slice(0, 6)}...${winner.walletAddress.slice(-4)}`
                              : <span className="text-muted-foreground italic">No wallet</span>
                            }
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {winner.rewardAmountUsd} USDC
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {preview.missingWallets.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    Show {preview.missingWallets.length} winner(s) without wallet
                  </summary>
                  <div className="mt-2 space-y-1 pl-4">
                    {preview.missingWallets.map((winner) => (
                      <div key={winner.fid} className="text-muted-foreground">
                        #{winner.rank} - {winner.username || `FID: ${winner.fid}`} - {winner.rewardAmountUsd} USDC
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <Button
            onClick={distributeRewards}
            disabled={!adminToken || isDistributing || preview?.alreadyDistributed || preview?.winners.length === 0}
            className="w-full"
            size="lg"
            data-testid="button-distribute-rewards"
          >
            {isDistributing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Distributing Rewards...
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-2" />
                Distribute Last Week Rewards
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="font-semibold">Distribution Result:</div>
              <div className="text-sm text-muted-foreground">
                Week: {result.weekStart} - {result.weekEnd}
              </div>
              <div className="space-y-1">
                {result.distributed.map((r: any, i: number) => (
                  <div key={i} className="text-sm p-2 bg-background rounded">
                    <div className="font-medium">
                      #{r.rank} {r.username || `FID: ${r.fid}`} - {r.amountUsd} USDC
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: {r.status}
                      {r.txHash && ` | TX: ${r.txHash.slice(0, 10)}...`}
                      {r.error && ` | Error: ${r.error}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Distributions</CardTitle>
            <CardDescription>Last 20 reward distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                >
                  <div>
                    <div className="font-medium">
                      #{reward.rank} FID: {reward.fid}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {reward.weekStart} - {reward.weekEnd}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{reward.amountUsd} USDC</div>
                    <div
                      className={`text-xs ${
                        reward.status === "sent"
                          ? "text-green-600 dark:text-green-400"
                          : reward.status === "failed"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {reward.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
