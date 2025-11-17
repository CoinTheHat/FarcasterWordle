import { createWalletClient, createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_WALLET_PRIVATE_KEY;
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

const USDC_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
  dryRun?: boolean;
}

export async function sendReward(
  toAddress: string,
  amountUsd: number,
  memo: string,
  dryRun: boolean = false
): Promise<TransferResult> {
  if (!SPONSOR_PRIVATE_KEY) {
    return {
      success: false,
      error: 'SPONSOR_WALLET_PRIVATE_KEY not configured',
    };
  }

  if (![10, 5, 3].includes(amountUsd)) {
    return {
      success: false,
      error: `Invalid reward amount: ${amountUsd}`,
    };
  }

  if (dryRun) {
    const fakeTxHash = `0xDRYRUN${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
    console.log(`[DRY RUN] Would send: ${amountUsd} USDC to ${toAddress}`);
    console.log(`[DRY RUN] Fake TX Hash: ${fakeTxHash}`);
    console.log(`[DRY RUN] Memo: ${memo}`);
    
    return {
      success: true,
      txHash: fakeTxHash,
      dryRun: true,
    };
  }

  try {
    const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const amountUsdc = parseUnits(amountUsd.toString(), 6);

    const hash = await walletClient.writeContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [toAddress as `0x${string}`, amountUsdc],
    });

    console.log(`Reward sent: ${amountUsd} USDC to ${toAddress}`);
    console.log(`TX Hash: ${hash}`);
    console.log(`Memo: ${memo}`);

    return {
      success: true,
      txHash: hash,
    };
  } catch (error: any) {
    console.error('USDC transfer failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

export async function getWalletBalance(): Promise<{ balance: string; usdcBalance?: string; error?: string }> {
  if (!SPONSOR_PRIVATE_KEY) {
    return {
      balance: '0',
      error: 'SPONSOR_WALLET_PRIVATE_KEY not configured',
    };
  }

  try {
    const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const usdcBalance = await publicClient.readContract({
      address: USDC_CONTRACT_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [account.address],
    });

    return {
      balance: '0',
      usdcBalance: formatUnits(usdcBalance, 6),
    };
  } catch (error: any) {
    return {
      balance: '0',
      error: error.message || 'Failed to fetch balance',
    };
  }
}
