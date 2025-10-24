import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';

export interface BurnerWallet {
  address: string;
  privateKey: string;
}

/**
 * Create new burner wallet
 * SECURITY: Key stays in-memory only (React state), never persisted
 * If page refreshes, user must create new burner wallet
 */
export function createBurnerWallet(): BurnerWallet {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  
  return {
    privateKey,
    address: account.address,
  };
}

/**
 * Get burner wallet client for signing transactions
 */
export function getBurnerClient(burner: BurnerWallet) {
  const account = privateKeyToAccount(burner.privateKey as `0x${string}`);
  
  return createWalletClient({
    account,
    chain: base,
    transport: http(),
  });
}

/**
 * Get burner wallet balance
 */
export async function getBurnerBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://mainnet.base.org`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });
    
    const data = await response.json();
    const balanceWei = BigInt(data.result);
    return formatEther(balanceWei);
  } catch (error) {
    console.error('Failed to get burner balance:', error);
    return '0';
  }
}

/**
 * Send transaction from burner wallet
 */
export async function sendBurnerTransaction(
  burner: BurnerWallet,
  to: string,
  data: string
): Promise<string> {
  const client = getBurnerClient(burner);
  
  const hash = await client.sendTransaction({
    to: to as `0x${string}`,
    value: BigInt(0),
    data: data as `0x${string}`,
    chain: base,
  });
  
  return hash;
}

/**
 * Fund burner wallet from main wallet
 */
export async function fundBurnerWallet(
  fromAddress: string,
  burnerAddress: string,
  amount: string,
  sendTransactionAsync: any
): Promise<string> {
  const hash = await sendTransactionAsync({
    to: burnerAddress as `0x${string}`,
    value: parseEther(amount),
    chainId: 8453, // Base mainnet
  });
  
  return hash;
}

/**
 * Withdraw remaining funds from burner to main wallet
 */
export async function withdrawFromBurner(
  burner: BurnerWallet,
  toAddress: string,
  amount: string
): Promise<string> {
  const client = getBurnerClient(burner);
  
  const hash = await client.sendTransaction({
    to: toAddress as `0x${string}`,
    value: parseEther(amount),
    chain: base,
  });
  
  return hash;
}

/**
 * Check if burner wallet has sufficient balance for N transactions
 */
export async function hasSufficientBalance(
  burnerAddress: string,
  requiredTxCount: number
): Promise<boolean> {
  const balance = await getBurnerBalance(burnerAddress);
  const balanceNum = parseFloat(balance);
  
  // Estimate: ~0.0001 ETH per transaction on Base
  const estimatedCost = requiredTxCount * 0.0001;
  
  return balanceNum >= estimatedCost;
}
