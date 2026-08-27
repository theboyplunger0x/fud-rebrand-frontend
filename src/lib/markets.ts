export type Interval = "6h" | "12h" | "24h";
export type Side = "up" | "down";
export type Currency = "USDC" | "FUD";

export const FEE_BY_CURRENCY: Record<Currency, number> = {
  USDC: 0.05,
  FUD: 0,
};

export type Market = {
  id: string;
  ticker: string;
  name: string;
  question: string;
  price: number;
  change24h: number;
  interval: Interval;
  createdBy: string;
  openerSide: Side;
  message: string;
  minutesLeft: number;
  upPool: number;
  downPool: number;
  traders: number;
  verified: boolean;
};

export const MARKETS: Market[] = [
  {
    id: "btc-24h-1",
    ticker: "BTC",
    name: "Bitcoin",
    question: "Will BTC close higher in 24h?",
    price: 96420.15,
    change24h: 2.41,
    interval: "24h",
    createdBy: "degen.base.eth",
    openerSide: "up",
    message: "BTC momentum survives the US open. I’m taking the breakout.",
    minutesLeft: 738,
    upPool: 18420,
    downPool: 11980,
    traders: 312,
    verified: true,
  },
  {
    id: "eth-6h-1",
    ticker: "ETH",
    name: "Ethereum",
    question: "ETH pumping into the London close?",
    price: 3184.72,
    change24h: -1.16,
    interval: "6h",
    createdBy: "vitalikfan.base.eth",
    openerSide: "down",
    message: "London keeps fading ETH. One more leg down before the close.",
    minutesLeft: 92,
    upPool: 4210,
    downPool: 6890,
    traders: 148,
    verified: true,
  },
  {
    id: "sol-12h-1",
    ticker: "SOL",
    name: "Solana",
    question: "SOL up or down before Asia open?",
    price: 214.08,
    change24h: 5.73,
    interval: "12h",
    createdBy: "sunny.base.eth",
    openerSide: "up",
    message: "SOL strength is real. Asia keeps buying every dip.",
    minutesLeft: 421,
    upPool: 9120,
    downPool: 3480,
    traders: 201,
    verified: true,
  },
  {
    id: "degen-24h-1",
    ticker: "DEGEN",
    name: "Degen",
    question: "DEGEN reclaiming after the airdrop dump?",
    price: 0.0084,
    change24h: -8.92,
    interval: "24h",
    createdBy: "tipster.base.eth",
    openerSide: "up",
    message: "Airdrop sellers look exhausted. The second move starts here.",
    minutesLeft: 1290,
    upPool: 1840,
    downPool: 2260,
    traders: 76,
    verified: false,
  },
  {
    id: "hype-6h-1",
    ticker: "HYPE",
    name: "Hyperliquid",
    question: "HYPE green on the 6h?",
    price: 38.41,
    change24h: 11.2,
    interval: "6h",
    createdBy: "perpmaxi.base.eth",
    openerSide: "up",
    message: "Perps volume keeps leading spot. HYPE has another leg.",
    minutesLeft: 47,
    upPool: 7340,
    downPool: 7110,
    traders: 189,
    verified: true,
  },
  {
    id: "zora-12h-1",
    ticker: "ZORA",
    name: "Zora",
    question: "ZORA bleeding for another 12h?",
    price: 0.0412,
    change24h: -3.05,
    interval: "12h",
    createdBy: "mintooor.base.eth",
    openerSide: "down",
    message: "Unlock pressure is not finished yet. I’m fading the bounce.",
    minutesLeft: 305,
    upPool: 980,
    downPool: 3120,
    traders: 54,
    verified: true,
  },
];

export type Position = {
  id: string;
  marketId: string;
  side: Side;
  stake: number;
  currency: Currency;
  entryOdds: number;
  status: "open" | "won" | "lost";
};

export const POSITIONS: Position[] = [
  {
    id: "p1",
    marketId: "btc-24h-1",
    side: "up",
    stake: 50,
    currency: "FUD",
    entryOdds: 1.62,
    status: "open",
  },
  {
    id: "p2",
    marketId: "eth-6h-1",
    side: "down",
    stake: 25,
    currency: "USDC",
    entryOdds: 1.58,
    status: "open",
  },
  {
    id: "p3",
    marketId: "sol-12h-1",
    side: "up",
    stake: 120,
    currency: "FUD",
    entryOdds: 1.35,
    status: "won",
  },
  {
    id: "p4",
    marketId: "zora-12h-1",
    side: "up",
    stake: 40,
    currency: "USDC",
    entryOdds: 3.1,
    status: "lost",
  },
];

export const WALLET = {
  address: "0x7a3f…c21b",
  usdc: 1240.55,
  fud: 8420,
};

export function sideOdds(market: Market, side: Side) {
  const total = market.upPool + market.downPool;
  const pool = side === "up" ? market.upPool : market.downPool;
  if (pool <= 0) return 1;
  return total / pool;
}

export function upChance(market: Market) {
  const total = market.upPool + market.downPool;
  return total === 0 ? 0.5 : market.upPool / total;
}

/** Parimutuel payout: your share of the losing pool, minus fee. */
export function quote(market: Market, side: Side, stake: number, currency: Currency) {
  const fee = FEE_BY_CURRENCY[currency];
  const net = stake * (1 - fee);
  const myPool = (side === "up" ? market.upPool : market.downPool) + net;
  const other = side === "up" ? market.downPool : market.upPool;
  const payout = net + (net / myPool) * other;
  return {
    fee: stake * fee,
    net,
    payout,
    profit: payout - stake,
    multiple: stake > 0 ? payout / stake : 0,
  };
}

export function formatUsd(value: number) {
  if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

export function formatCountdown(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
