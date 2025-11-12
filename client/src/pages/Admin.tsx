import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Wallet, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [adminToken, setAdminToken] = useState("");
  const [isDistributing, setIsDistributing] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

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
          <Button
            onClick={distributeRewards}
            disabled={!adminToken || isDistributing}
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
