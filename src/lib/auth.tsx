import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  clearSessionToken,
  getSessionToken,
  isUnauthorized,
  profileApi,
  setSessionToken,
  type BackendUser,
} from "@/lib/api";

const BETA_PRIVY_APP_ID = "cmpjz8lxw01o90djox4imgrgk";
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || BETA_PRIVY_APP_ID;

type AuthState = {
  user: BackendUser | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  saveProfile: (avatarUrl: string | null | undefined, bio: string) => Promise<BackendUser>;
};

const AuthContext = createContext<AuthState | null>(null);

function FudSessionProvider({ children }: { children: ReactNode }) {
  const {
    ready: privyReady,
    authenticated,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    getAccessToken,
  } = usePrivy();
  const { wallets } = useWallets();
  const [user, setUser] = useState<BackendUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrapInFlight = useRef(false);

  const bootstrap = useCallback(async () => {
    if (!privyReady || !authenticated || !privyUser || bootstrapInFlight.current) return;
    if (getSessionToken()) return;
    bootstrapInFlight.current = true;
    setBootstrapping(true);
    setError(null);
    try {
      let accessToken: string | null = null;
      for (let attempt = 0; attempt < 6 && !accessToken; attempt += 1) {
        accessToken = await getAccessToken().catch(() => null);
        if (!accessToken) await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!accessToken) throw new Error("Privy session is still loading. Try again.");

      const linkedWallets = wallets.map((wallet) => ({
        address: wallet.address,
        type: wallet.walletClientType === "privy" ? "embedded" : "external",
        is_embedded: wallet.walletClientType === "privy",
      }));
      const result = await profileApi.bootstrap({
        privy_token: accessToken,
        privy_user_id: privyUser.id,
        auth_method: privyUser.google ? "google" : privyUser.email ? "email" : "wallet",
        ...(privyUser.email?.address ? { email: privyUser.email.address } : {}),
        ...(linkedWallets.length > 0 ? { wallets: linkedWallets } : {}),
      });
      setSessionToken(result.token);
      setUser(result.user);
    } catch (bootstrapError) {
      setError(bootstrapError instanceof Error ? bootstrapError.message : "Could not sign in.");
    } finally {
      bootstrapInFlight.current = false;
      setBootstrapping(false);
    }
  }, [authenticated, getAccessToken, privyReady, privyUser, wallets]);

  useEffect(() => {
    let active = true;
    async function restore() {
      if (!getSessionToken()) {
        if (active) setRestoring(false);
        return;
      }
      try {
        const currentUser = await profileApi.me();
        if (active) setUser(currentUser);
      } catch (restoreError) {
        if (!isUnauthorized(restoreError) && active) {
          setError(
            restoreError instanceof Error ? restoreError.message : "Could not restore session.",
          );
        }
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!restoring && authenticated && !user && !getSessionToken()) void bootstrap();
  }, [authenticated, bootstrap, restoring, user]);

  const logout = useCallback(async () => {
    clearSessionToken();
    setUser(null);
    setError(null);
    await privyLogout();
  }, [privyLogout]);

  const saveProfile = useCallback(async (avatarUrl: string | null | undefined, bio: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await profileApi.update(avatarUrl, bio);
      setUser(updated);
      return updated;
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save profile.";
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading: restoring || !privyReady || bootstrapping,
      saving,
      error,
      login: privyLogin,
      logout,
      saveProfile,
    }),
    [bootstrapping, error, logout, privyLogin, privyReady, restoring, saveProfile, saving, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: { theme: "dark", accentColor: "#3138ff" },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: { ethereum: { createOnLogin: "all-users" } },
        loginMethods: ["email", "wallet", "google"],
      }}
    >
      <FudSessionProvider>{children}</FudSessionProvider>
    </PrivyProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
