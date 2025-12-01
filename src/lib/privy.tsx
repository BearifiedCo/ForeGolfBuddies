import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PrivyProvider as BasePrivyProvider, usePrivy, useEmbeddedWallet } from '@privy-io/expo';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabaseAuthService } from '../api/supabase-auth-service';

const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
const SOLANA_RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const FOREPOINTS_TOKEN_MINT = process.env.EXPO_PUBLIC_FOREPOINTS_TOKEN_MINT || '';

// Solana connection
export const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');

interface WalletContextType {
  walletAddress: string | null;
  solBalance: number;
  forepointsTokenBalance: number;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  sendSol: (to: string, amount: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  solBalance: 0,
  forepointsTokenBalance: 0,
  isLoading: false,
  error: null,
  refreshBalances: async () => {},
  sendSol: async () => '',
});

export const useWallet = () => useContext(WalletContext);

// Privy configuration for ForeBuddies
export const privyConfig = {
  appId: PRIVY_APP_ID,
  clientId: 'forebuddies',
  loginMethods: ['email', 'sms'],
  appearance: {
    theme: 'light' as const,
    accentColor: '#10288F', // Golf green/blue
    logo: 'https://forebuddies.com/logo.png',
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
    requireUserPasswordOnCreate: false,
  },
  // Configure for Solana
  supportedChains: [
    {
      id: 'solana:mainnet',
      name: 'Solana',
      network: 'mainnet-beta',
      nativeCurrency: {
        name: 'SOL',
        symbol: 'SOL',
        decimals: 9,
      },
      rpcUrls: {
        default: { http: [SOLANA_RPC_URL] },
      },
    },
  ],
};

// Wallet Provider Component
function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user, authenticated } = usePrivy();
  const { wallet } = useEmbeddedWallet();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState(0);
  const [forepointsTokenBalance, setForepointsTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get wallet address from Privy embedded wallet
  useEffect(() => {
    if (wallet && wallet.address) {
      setWalletAddress(wallet.address);

      // Save wallet address to Supabase profile if user is authenticated
      if (user?.id) {
        supabaseAuthService.updateWalletAddress(user.id, wallet.address).catch(console.error);
      }
    }
  }, [wallet, user]);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const pubkey = new PublicKey(walletAddress);

      // Get SOL balance
      const balance = await solanaConnection.getBalance(pubkey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      // Get ForePoints token balance if token mint is configured
      if (FOREPOINTS_TOKEN_MINT) {
        try {
          const tokenMint = new PublicKey(FOREPOINTS_TOKEN_MINT);
          const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(pubkey, {
            mint: tokenMint,
          });

          if (tokenAccounts.value.length > 0) {
            const tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            setForepointsTokenBalance(tokenBalance || 0);
          }
        } catch (tokenError) {
          console.log('Token balance fetch failed (token may not exist yet):', tokenError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Refresh balances when wallet changes
  useEffect(() => {
    if (walletAddress) {
      refreshBalances();
    }
  }, [walletAddress, refreshBalances]);

  // Send SOL to another address
  const sendSol = useCallback(async (to: string, amount: number): Promise<string> => {
    if (!wallet || !walletAddress) {
      throw new Error('Wallet not connected');
    }

    const fromPubkey = new PublicKey(walletAddress);
    const toPubkey = new PublicKey(to);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await solanaConnection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Sign with Privy embedded wallet
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await solanaConnection.sendRawTransaction(signedTx.serialize());

    // Wait for confirmation
    await solanaConnection.confirmTransaction(signature, 'confirmed');

    // Refresh balances after transaction
    await refreshBalances();

    return signature;
  }, [wallet, walletAddress, refreshBalances]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        solBalance,
        forepointsTokenBalance,
        isLoading,
        error,
        refreshBalances,
        sendSol,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Main Privy Provider that wraps the app
export function PrivyAppProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    console.warn('Privy App ID not configured. Wallet features will be disabled.');
    return <>{children}</>;
  }

  return (
    <BasePrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </BasePrivyProvider>
  );
}

// Hook to use Privy auth with ForeBuddies integration
export function usePrivyAuth() {
  const {
    login,
    logout,
    authenticated,
    user,
    ready,
    linkEmail,
    linkPhone,
  } = usePrivy();

  const { wallet, create: createWallet } = useEmbeddedWallet();
  const walletContext = useWallet();

  const ensureWallet = useCallback(async () => {
    if (!wallet && authenticated) {
      try {
        await createWallet();
      } catch (err) {
        console.error('Failed to create wallet:', err);
      }
    }
  }, [wallet, authenticated, createWallet]);

  return {
    // Privy auth
    login,
    logout,
    authenticated,
    user,
    ready,
    linkEmail,
    linkPhone,

    // Wallet
    wallet,
    ensureWallet,
    ...walletContext,
  };
}
