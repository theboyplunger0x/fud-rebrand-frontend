import type { Side } from "@/lib/markets";

export type PublicPosition = {
  id: string;
  ticker: string;
  question: string;
  side: Side;
  amount: number;
  entryOdds: number;
  status: "open" | "won" | "lost";
  pnl: number;
  message: string;
};

export type PublicProfile = {
  username: string;
  displayName: string;
  avatar?: string;
  xUsername: string;
  bio: string;
  joined: string;
  views: string;
  followers: number;
  positionsValue: number;
  biggestWin: number;
  predictions: number;
  pnl: number;
  winRate: number;
  volume: number;
  positions: PublicPosition[];
};

const profileSeeds: Array<Omit<PublicProfile, "positions"> & { positions: PublicPosition[] }> = [
  {
    username: "degen.base.eth",
    displayName: "Degen",
    avatar: "/profile-avatar.svg",
    xUsername: "degentrades",
    bio: "Momentum, narratives and receipts. Every take gets a price.",
    joined: "Jun 2025",
    views: "12.4K",
    followers: 1842,
    positionsValue: 12940,
    biggestWin: 2840,
    predictions: 24,
    pnl: 3842,
    winRate: 61,
    volume: 28440,
    positions: [
      {
        id: "degen-btc",
        ticker: "BTC",
        question: "Will BTC close higher in 24h?",
        side: "up",
        amount: 850,
        entryOdds: 1.62,
        status: "open",
        pnl: 0,
        message: "BTC momentum survives the US open.",
      },
      {
        id: "degen-sol",
        ticker: "SOL",
        question: "SOL up or down before Asia open?",
        side: "up",
        amount: 420,
        entryOdds: 1.78,
        status: "won",
        pnl: 327.6,
        message: "Asia keeps buying the dip.",
      },
    ],
  },
  {
    username: "vitalikfan.base.eth",
    displayName: "Vitalik Fan",
    xUsername: "vitalikfan",
    bio: "ETH structure, flows and questionable London-open decisions.",
    joined: "Sep 2025",
    views: "8.1K",
    followers: 967,
    positionsValue: 6840,
    biggestWin: 1610,
    predictions: 19,
    pnl: 1740,
    winRate: 58,
    volume: 16980,
    positions: [],
  },
  {
    username: "sunny.base.eth",
    displayName: "Sunny",
    xUsername: "sunnycalls",
    bio: "Solana calls before breakfast.",
    joined: "Oct 2025",
    views: "6.7K",
    followers: 721,
    positionsValue: 5210,
    biggestWin: 980,
    predictions: 17,
    pnl: 1124,
    winRate: 65,
    volume: 12420,
    positions: [],
  },
  {
    username: "tipster.base.eth",
    displayName: "Tipster",
    xUsername: "tipsteronbase",
    bio: "Airdrops, unlocks and the second move.",
    joined: "Nov 2025",
    views: "4.9K",
    followers: 438,
    positionsValue: 3480,
    biggestWin: 740,
    predictions: 14,
    pnl: 628,
    winRate: 57,
    volume: 8940,
    positions: [],
  },
  {
    username: "perpmaxi.base.eth",
    displayName: "Perp Maxi",
    xUsername: "perpmaxi",
    bio: "Funding, open interest and crowded trades.",
    joined: "Aug 2025",
    views: "9.8K",
    followers: 1316,
    positionsValue: 18420,
    biggestWin: 4120,
    predictions: 31,
    pnl: 5290,
    winRate: 68,
    volume: 42350,
    positions: [],
  },
  {
    username: "mintooor.base.eth",
    displayName: "Mintooor",
    xUsername: "mintooor",
    bio: "Creator coins, unlocks and onchain attention.",
    joined: "Dec 2025",
    views: "3.6K",
    followers: 284,
    positionsValue: 2760,
    biggestWin: 630,
    predictions: 12,
    pnl: 410,
    winRate: 55,
    volume: 7120,
    positions: [],
  },
];

export const PUBLIC_PROFILES: PublicProfile[] = profileSeeds;

export function getPublicProfile(username: string) {
  return PUBLIC_PROFILES.find(
    (profile) => profile.username.toLowerCase() === username.toLowerCase(),
  );
}

export function profileInitials(username: string) {
  return username
    .replace(".base.eth", "")
    .split(/[._-]/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
