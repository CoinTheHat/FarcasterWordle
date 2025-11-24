import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wallet, DollarSign, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery<VerifyData>({
    queryKey: ["/api/verify"],
  });

  const formatAddress = (address: string | null) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBaseScanUrl = (txHash: string | null) => {
    if (!txHash) return null;
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
            <CardTitle className="text-destructive">{t.verifyErrorTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t.verifyErrorMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-verify-title">
          {t.verifyTitle}
        </h1>
        <p className="text-muted-foreground" data-testid="text-verify-description">
          {t.verifyDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-sponsor-wallet">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.verifySponsorWallet}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-sm font-mono mb-2" data-testid="text-sponsor-address">
                  {data?.sponsorWallet ? formatAddress(data.sponsorWallet) : t.verifyNotConfigured}
                </div>
                {data?.sponsorWallet && (
                  <a
                    href={getAddressUrl(data.sponsorWallet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    data-testid="link-sponsor-basescan"
                  >
                    {t.verifyViewBaseScan}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-usdc-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.verifyCurrentBalance}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-usdc-balance">
                {formatCurrency(data?.usdcBalance || "0")} USDC
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-total-distributed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.verifyTotalDistributed}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-distributed">
                {formatCurrency(data?.totalDistributed || 0)} USDC
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-payment-history">
        <CardHeader>
          <CardTitle>{t.verifyRecentPayments}</CardTitle>
          <CardDescription>{t.verifyRecentPaymentsDesc}</CardDescription>
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
                    <TableHead>{t.verifyDate}</TableHead>
                    <TableHead>{t.verifyPlayer}</TableHead>
                    <TableHead>{t.verifyWallet}</TableHead>
                    <TableHead>{t.verifyWeek}</TableHead>
                    <TableHead>{t.verifyRank}</TableHead>
                    <TableHead>{t.verifyAmount}</TableHead>
                    <TableHead>{t.verifyTransaction}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPayments.map((payment) => (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell className="text-sm" data-testid={`text-date-${payment.id}`}>
                        {formatDate(payment.distributedAt)}
                      </TableCell>
                      <TableCell data-testid={`text-username-${payment.id}`}>
                        {payment.username || t.verifyAnonymous}
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
                        {formatCurrency(payment.amountUsd)}
                      </TableCell>
                      <TableCell data-testid={`link-tx-${payment.id}`}>
                        {payment.txHash && getBaseScanUrl(payment.txHash) ? (
                          <a
                            href={getBaseScanUrl(payment.txHash)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {payment.txHash.slice(0, 6)}...{payment.txHash.slice(-4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t.verifyPending}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-payments">
              {t.verifyNoPayments}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
