import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';

// Coinbase Paymaster URL for sponsored transactions
export const PAYMASTER_URL = import.meta.env.VITE_PAYMASTER_URL || '';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  connectors: [miniAppConnector()],
  ssr: false,
});
