export type BackendUser = {
  id: string;
  username: string;
  balance_usd: string;
  wallet_address?: string | null;
  has_connected_wallet?: boolean;
  tier?: string;
  is_market_maker?: boolean;
  x_username?: string | null;
  telegram_username?: string | null;
  discord_username?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
};

export type BackendPublicProfile = {
  username: string;
  avatar_url: string | null;
  bio: string | null;
  tier?: string;
  created_at?: string;
  x_username?: string | null;
  follower_count: number;
  following_count: number;
  total_bets: number;
  wins: number;
  losses: number;
  neutrals: number;
  pnl: string;
  volume: string;
};

export type BackendSeasonMe = {
  creatorVerification?: {
    status: "linked" | "verified";
    walletAddress: string;
    fudpBalance: number | null;
    tokenAddress?: string | null;
    verifiedAt: string;
    lastSyncedAt?: string | null;
  } | null;
  creator_verification?: BackendSeasonMe["creatorVerification"];
};

type BootstrapPayload = {
  privy_token: string;
  privy_user_id: string;
  auth_method: string;
  email?: string;
  wallets?: Array<{ address: string; type: string; is_embedded: boolean }>;
};

type BootstrapResponse = {
  token: string;
  user: BackendUser;
  created: boolean;
};

const configuredApiBase = import.meta.env.VITE_API_URL?.trim();

if (!import.meta.env.DEV && !configuredApiBase) {
  throw new Error("VITE_API_URL is required for production builds.");
}

export const API_BASE = (configuredApiBase || "/api-backend").replace(/\/$/, "");

const TOKEN_KEY = "token";

export function getSessionToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearSessionToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearSessionToken();
    throw new ApiError(
      typeof data?.error === "string" ? data.error : `Request failed (${response.status})`,
      response.status,
    );
  }
  return data as T;
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export const profileApi = {
  me: () => request<BackendUser>("/auth/me"),

  bootstrap: (payload: BootstrapPayload) =>
    request<BootstrapResponse>("/api/users/bootstrap", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (avatarUrl: string | null | undefined, bio: string) => {
    const payload: { avatar_url?: string | null; bio: string } = { bio };
    if (avatarUrl !== undefined) payload.avatar_url = avatarUrl;
    return request<BackendUser>("/auth/update-profile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  publicProfile: (username: string) =>
    request<BackendPublicProfile>(`/users/${encodeURIComponent(username)}`),

  seasonMe: () => request<BackendSeasonMe>("/season/me"),
};

export function backendAvatarUrl(username: string) {
  return `${API_BASE}/users/${encodeURIComponent(username)}/avatar`;
}
