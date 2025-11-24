import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wallet, DollarSign, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VerifyData {
  sponsorWallet: string | null;
  usdcBalance: string;
  totalDistributed: number;
  recentPayments: Array<{
    id: number;
    username: string | null;
    walletAddress: string | null;
    weekStart: string;
    weekEnd: string;
    rank: number;
    amountUsd: number;
    txHash: string | null;
    distributedAt: string;
  }>;
}

export default function Verify() {
  const { data, isLoading, error } = useQuery<VerifyData>({
    queryKey: ["/api/verify"],
  });

  const formatAddress = (address: string | null) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBaseScanUrl = (txHash: string) => {
    return `https://basescan.org/tx/${txHash}`;
  };

  const getAddressUrl = (address: string) => {
    return `https://basescan.org/address/${address}`;
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load verification data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-verify-title">
          Transparency & Verification
        </h1>
        <p className="text-muted-foreground" data-testid="text-verify-description">
          All USDC reward distributions are publicly verifiable on the Base blockchain.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-sponsor-wallet">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsor Wallet</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-sm font-mono mb-2" data-testid="text-sponsor-address">
                  {data?.sponsorWallet ? formatAddress(data.sponsorWallet) : "Not configured"}
                </div>
                {data?.sponsorWallet && (
                  <a
                    href={getAddressUrl(data.sponsorWallet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    data-testid="link-sponsor-basescan"
                  >
                    View on BaseScan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-usdc-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-usdc-balance">
                ${parseFloat(data?.usdcBalance || "0").toFixed(2)} USDC
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-distributed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-distributed">
                ${data?.totalDistributed || 0} USDC
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-payment-history">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest 50 successful USDC reward distributions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.recentPayments && data.recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Week</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="text-sm" data-testid={`text-date-${payment.id}`}>
                        {formatDate(payment.distributedAt)}
                      </TableCell>
                      <TableCell data-testid={`text-username-${payment.id}`}>
                        {payment.username || "Anonymous"}
                      </TableCell>
                      <TableCell className="font-mono text-xs" data-testid={`text-wallet-${payment.id}`}>
                        {formatAddress(payment.walletAddress)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground" data-testid={`text-week-${payment.id}`}>
                        {payment.weekStart}
                      </TableCell>
                      <TableCell data-testid={`text-rank-${payment.id}`}>
                        <Badge variant={payment.rank === 1 ? "default" : "secondary"}>
                          #{payment.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`text-amount-${payment.id}`}>
                        ${payment.amountUsd}
                      </TableCell>
                      <TableCell data-testid={`link-tx-${payment.id}`}>
                        {payment.txHash ? (
                          <a
                            href={getBaseScanUrl(payment.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {payment.txHash.slice(0, 6)}...{payment.txHash.slice(-4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-payments">
              No payments distributed yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
