import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  createBurnerWallet,
  fundBurnerWallet,
  getBurnerBalance,
  type BurnerWallet,
} from "@/lib/burner";

interface BurnerSetupModalProps {
  isOpen: boolean;
  onComplete: (burner: BurnerWallet) => void;
  mainWalletAddress?: string;
  sendTransactionAsync: any;
}

export function BurnerSetupModal({
  isOpen,
  onComplete,
  mainWalletAddress,
  sendTransactionAsync,
}: BurnerSetupModalProps) {
  const [burner, setBurner] = useState<BurnerWallet | null>(null);
  const [fundAmount, setFundAmount] = useState("0.002");
  const [isFunding, setIsFunding] = useState(false);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"create" | "fund" | "ready">("create");

  useEffect(() => {
    if (isOpen && !burner) {
      // Create new burner wallet (in-memory only)
      const newBurner = createBurnerWallet();
      setBurner(newBurner);
      setStep("fund");
    }
  }, [isOpen]);

  const checkBalance = async (address: string) => {
    const bal = await getBurnerBalance(address);
    setBalance(bal);
    
    if (parseFloat(bal) >= 0.001) {
      setStep("ready");
    } else {
      setStep("fund");
    }
  };

  const handleFund = async () => {
    if (!burner || !mainWalletAddress) return;
    
    setIsFunding(true);
    setError("");
    
    try {
      await fundBurnerWallet(
        mainWalletAddress,
        burner.address,
        fundAmount,
        sendTransactionAsync
      );
      
      // Wait a bit for TX to confirm
      setTimeout(async () => {
        await checkBalance(burner.address);
        setIsFunding(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to fund burner:", err);
      setError(err instanceof Error ? err.message : "Failed to fund burner wallet");
      setIsFunding(false);
    }
  };

  const handleComplete = () => {
    if (burner) {
      onComplete(burner);
    }
  };

  if (!burner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Session Wallet Setup
          </DialogTitle>
          <DialogDescription>
            Create a temporary wallet for automatic transactions during gameplay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Burner Address */}
          <div className="bg-card border border-card-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Session Wallet Address</div>
            <div className="font-mono text-xs break-all">{burner.address}</div>
          </div>

          {/* Balance */}
          <div className="bg-card border border-card-border rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-primary">
              {parseFloat(balance).toFixed(4)} ETH
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ {(parseFloat(balance) / 0.0001).toFixed(0)} transactions
            </div>
          </div>

          {step === "fund" && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Fund this wallet to enable automatic transactions. Each guess will cost ~0.0001 ETH on Base.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fund Amount (ETH)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.002"
                  data-testid="input-fund-amount"
                />
                <div className="text-xs text-muted-foreground">
                  Recommended: 0.002 ETH for ~20 guesses
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === "ready" && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-600 dark:text-green-400">
                Session wallet is funded and ready! All guesses will automatically create on-chain transactions.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === "fund" && (
            <Button
              onClick={handleFund}
              disabled={isFunding || !mainWalletAddress}
              className="w-full"
              data-testid="button-fund-burner"
            >
              {isFunding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Funding...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Fund Wallet
                </>
              )}
            </Button>
          )}

          {step === "ready" && (
            <Button
              onClick={handleComplete}
              className="w-full"
              data-testid="button-start-game"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Start Playing
            </Button>
          )}
        </DialogFooter>

        <div className="text-xs text-muted-foreground text-center border-t pt-4">
          💡 Tip: You can withdraw unused funds after the game ends
        </div>
      </DialogContent>
    </Dialog>
  );
}
