import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Clock, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import { BottomNav, ConnectButton, Page } from "@/components/app-shell";
import { ConnectWalletDialog } from "@/components/connect-wallet";
import { CreateMarketModal } from "@/components/create-market-modal";
import { OddsBar, TokenAvatar } from "@/components/market-card";
import { useWallet } from "@/lib/wallet";

import {
  FEE_BY_CURRENCY,
  MARKETS,
  WALLET,
  formatCountdown,
  formatUsd,
  quote,
  sideOdds,
  upChance,
  type Currency,
  type Side,
} from "@/lib/markets";

export const Route = createFileRoute("/market/$marketId")({
  loader: ({ params }) => {
    const market = MARKETS.find((m) => m.id === params.marketId);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Market not found — FUD Markets" }, { name: "robots", content: "noindex" }],
      };
    }
    const { market } = loaderData;
    const title = `$${market.ticker} ${market.interval} — FUD Markets`;
    const description = `${market.question} Trade UP or DOWN on $${market.ticker} with USDC or FUDCOIN.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MarketDetail,
});

const AMOUNTS = [5, 25, 100, 500];

function MarketDetail() {
  const { market } = Route.useLoaderData();
  const [createOpen, setCreateOpen] = useState(false);
  const [side, setSide] = useState<Side>("up");
  const [currency, setCurrency] = useState<Currency>("FUD");
  const [amount, setAmount] = useState(25);
  const [connectOpen, setConnectOpen] = useState(false);
  const { connected } = useWallet();

  const chance = upChance(market);
  const pct = Math.round(chance * 100);
  const q = quote(market, side, amount, currency);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            to="/"
            className="flex size-9 items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="num rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">
            {formatCountdown(market.minutesLeft)} left
          </span>
          <div className="ml-auto">
            <ConnectButton />
          </div>
        </div>
      </header>

      <Page>
        <div className="flex items-start gap-3">
          <TokenAvatar ticker={market.ticker} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold">${market.ticker}</h1>
              {market.verified ? <BadgeCheck className="size-4 text-primary" /> : null}
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
                {market.interval}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{market.question}</p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Spot price</div>
            <div className="num text-2xl font-bold">{formatUsd(market.price)}</div>
          </div>
          <div
            className={`num text-sm font-bold ${market.change24h >= 0 ? "text-up" : "text-down"}`}
          >
            {market.change24h >= 0 ? "+" : ""}
            {market.change24h.toFixed(2)}%
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-up">UP {pct}%</span>
            <span className="text-down">DOWN {100 - pct}%</span>
          </div>
          <div className="mt-2">
            <OddsBar chance={chance} />
          </div>
          <div className="num mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" /> {market.traders} traders
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> resolves in {formatCountdown(market.minutesLeft)}
            </span>
            <span className="ml-auto font-semibold text-foreground">
              {formatUsd(market.upPool + market.downPool)} pool
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-bold">Take a side</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["up", "down"] as Side[]).map((s) => {
            const active = side === s;
            const isUp = s === "up";
            return (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  active
                    ? isUp
                      ? "border-up bg-up-soft"
                      : "border-down bg-down-soft"
                    : "border-border bg-background"
                }`}
              >
                <div className={`text-sm font-bold ${isUp ? "text-up" : "text-down"}`}>
                  {isUp ? "UP" : "DOWN"}
                </div>
                <div className="num mt-1 text-lg font-bold">{sideOdds(market, s).toFixed(2)}x</div>
                <div className="text-[11px] text-muted-foreground">current payout</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-border p-4">
          <div className="flex items-center rounded-xl border border-input px-3">
            <input
              value={amount}
              inputMode="decimal"
              onChange={(e) => setAmount(Number(e.target.value.replace(/[^0-9.]/g, "")) || 0)}
              className="num w-full bg-transparent py-3 text-2xl font-bold outline-none"
            />
            <span className="text-xs font-semibold text-muted-foreground">{currency}</span>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`num rounded-full py-2 text-xs font-semibold ${
                  amount === a
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["USDC", "FUD"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-xl border p-3 text-left ${
                  currency === c ? "border-primary bg-accent" : "border-border"
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  {c === "FUD" ? <Zap className="size-3.5 text-primary" /> : null}
                  {c === "FUD" ? "FUDCOIN" : "USDC"}
                </div>
                <div className="text-[11px] font-semibold text-primary">
                  {FEE_BY_CURRENCY[c] === 0 ? "0% fee" : "5% fee"}
                </div>
                <div className="num text-[10px] text-muted-foreground">
                  {c === "FUD"
                    ? `${WALLET.fud.toLocaleString("en-US")} available`
                    : `${WALLET.usdc.toFixed(2)} available`}
                </div>
              </button>
            ))}
          </div>

          <dl className="num mt-4 space-y-1.5 text-xs">
            <Row label="Fee" value={`${q.fee.toFixed(2)} ${currency}`} />
            <Row label="Payout multiple" value={`${q.multiple.toFixed(2)}x`} />
            <Row
              label="To win"
              value={`${q.payout.toFixed(2)} ${currency}`}
              strong
              tone={side === "up" ? "up" : "down"}
            />
            <Row
              label="Profit"
              value={`${q.profit >= 0 ? "+" : ""}${q.profit.toFixed(2)} ${currency}`}
            />
          </dl>

          {connected ? (
            <button
              onClick={() =>
                toast.success(`${side.toUpperCase()} $${market.ticker} · ${amount} ${currency}`, {
                  description: `To win ${q.payout.toFixed(2)} ${currency} (${q.multiple.toFixed(2)}x)`,
                })
              }
              className={`mt-4 w-full rounded-full py-3.5 text-sm font-bold text-primary-foreground transition-opacity active:opacity-80 ${
                side === "up" ? "bg-up" : "bg-down"
              }`}
            >
              Bet {amount} {currency} on {side.toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => setConnectOpen(true)}
              className="fud-glass-primary mt-4 w-full rounded-full py-3.5 text-sm font-bold active:opacity-80"
            >
              Connect wallet to bet
            </button>
          )}

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Created by {market.createdBy}
          </p>
        </div>
      </Page>
      <BottomNav onCreate={() => setCreateOpen(true)} />
      <CreateMarketModal open={createOpen} onOpenChange={setCreateOpen} />
      <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "up" | "down";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`${strong ? "text-sm font-bold" : "font-semibold"} ${
          tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
