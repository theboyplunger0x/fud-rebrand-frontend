import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { WALLET } from "@/lib/markets";

export type WalletProvider = "coinbase" | "metamask" | "walletconnect" | "email";

type WalletState = {
  connected: boolean;
  address: string;
  provider: WalletProvider | null;
  usdc: number;
  fud: number;
  connect: (provider: WalletProvider, label?: string) => void;
  disconnect: () => void;
};

const STORAGE_KEY = "fud.wallet";

const WalletContext = createContext<WalletState | null>(null);

export function WalletProviderRoot({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<WalletProvider | null>(null);
  const [address, setAddress] = useState(WALLET.address);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { provider: WalletProvider; address: string };
      setProvider(parsed.provider);
      setAddress(parsed.address);
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback((next: WalletProvider, label?: string) => {
    const addr = label ?? WALLET.address;
    setProvider(next);
    setAddress(addr);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider: next, address: addr }));
    } catch {
      /* ignore */
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setAddress(WALLET.address);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      connected: provider !== null,
      address,
      provider,
      usdc: WALLET.usdc,
      fud: WALLET.fud,
      connect,
      disconnect,
    }),
    [provider, address, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProviderRoot");
  return ctx;
}
