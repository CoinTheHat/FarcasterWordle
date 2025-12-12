import { createPublicClient, http, type Account, type WalletClient } from 'viem';
import { base } from 'viem/chains';

const PAYMASTER_URL = import.meta.env.VITE_PAYMASTER_URL || '';
const BUNDLER_URL = PAYMASTER_URL; // Coinbase uses same URL for both

export interface SponsoredTxResult {
  hash: string;
  sponsored: boolean;
}

/**
 * Send a sponsored transaction using Coinbase Paymaster
 * Falls back to regular transaction if paymaster fails
 */
export async function sendSponsoredTransaction(
  walletClient: WalletClient,
  to: `0x${string}`,
  value: bigint = BigInt(0)
): Promise<SponsoredTxResult> {
  const account = walletClient.account;
  
  if (!account) {
    throw new Error('No account connected');
  }

  // Try sponsored transaction first if paymaster is configured
  if (PAYMASTER_URL) {
    try {
      console.log('Attempting sponsored transaction via Coinbase Paymaster...');
      
      // Create public client for Base
      const publicClient = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org'),
      });

      // Check if wallet supports EIP-5792 (wallet_sendCalls)
      // This is the standard for sponsored transactions
      const capabilities = await getWalletCapabilities(walletClient, account.address);
      
      if (capabilities?.paymasterService?.supported) {
        console.log('Wallet supports paymaster, sending sponsored call...');
        
        // Use wallet_sendCalls with paymaster
        const callsId = await walletClient.request({
          method: 'wallet_sendCalls' as any,
          params: [{
            version: '1.0',
            chainId: `0x${base.id.toString(16)}`,
            from: account.address,
            calls: [{
              to,
              value: `0x${value.toString(16)}`,
              data: '0x',
            }],
            capabilities: {
              paymasterService: {
                url: PAYMASTER_URL,
              },
            },
          }],
        });
        
        console.log('Sponsored transaction sent, batch ID:', callsId);
        
        // For EIP-5792, we get a batch ID, use it as hash
        return {
          hash: callsId as string,
          sponsored: true,
        };
      }
    } catch (err) {
      console.warn('Sponsored transaction failed, falling back to regular:', err);
    }
  }

  // Fallback to regular transaction
  console.log('Using regular transaction (user pays gas)');
  const hash = await walletClient.sendTransaction({
    account,
    to,
    value,
    chain: base,
  });

  return {
    hash,
    sponsored: false,
  };
}

/**
 * Get wallet capabilities for EIP-5792 support
 */
async function getWalletCapabilities(
  walletClient: WalletClient,
  address: `0x${string}`
): Promise<any> {
  try {
    const capabilities = await walletClient.request({
      method: 'wallet_getCapabilities' as any,
      params: [address],
    });
    
    if (!capabilities || typeof capabilities !== 'object') {
      return null;
    }
    
    // Return capabilities for Base chain (check both numeric and hex keys)
    const caps = capabilities as Record<string | number, any>;
    return caps[base.id] || caps[`0x${base.id.toString(16)}`] || null;
  } catch (err) {
    console.log('wallet_getCapabilities not supported:', err);
    return null;
  }
}
