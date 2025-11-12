import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_WALLET_PRIVATE_KEY;
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function sendReward(
  toAddress: string,
  amountUsd: number,
  memo: string
): Promise<TransferResult> {
  if (!SPONSOR_PRIVATE_KEY) {
    return {
      success: false,
      error: 'SPONSOR_WALLET_PRIVATE_KEY not configured',
    };
  }

  try {
    const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(BASE_RPC_URL),
    });

    const rewardAmounts: { [key: number]: string } = {
      10: '0.01',
      5: '0.005',
      3: '0.003',
    };

    const amountEthString = rewardAmounts[amountUsd] || '0';
    if (amountEthString === '0') {
      return {
        success: false,
        error: `Invalid reward amount: ${amountUsd}`,
      };
    }

    const amountEth = parseEther(amountEthString);

    const hash = await walletClient.sendTransaction({
      to: toAddress as `0x${string}`,
      value: amountEth,
      data: `0x${Buffer.from(memo).toString('hex')}` as `0x${string}`,
    });

    console.log(`Reward sent: ${formatEther(amountEth)} ETH (~$${amountUsd}) to ${toAddress}`);
    console.log(`TX Hash: ${hash}`);
    console.log(`Memo: ${memo}`);

    return {
      success: true,
      txHash: hash,
    };
  } catch (error: any) {
    console.error('Transfer failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

export async function getWalletBalance(): Promise<{ balance: string; error?: string }> {
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

    const balance = await publicClient.getBalance({
      address: account.address,
    });

    return {
      balance: formatEther(balance),
    };
  } catch (error: any) {
    return {
      balance: '0',
      error: error.message || 'Failed to fetch balance',
    };
  }
}
