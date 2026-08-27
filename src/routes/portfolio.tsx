import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, Page, TopBar } from "@/components/app-shell";
import { CreateMarketModal } from "@/components/create-market-modal";
import { TokenAvatar } from "@/components/market-card";
import { MARKETS, POSITIONS, WALLET, formatUsd } from "@/lib/markets";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Profile — FUD Markets" },
      {
        name: "description",
        content: "Your FUD profile, market activity, positions and balances.",
      },
      { property: "og:title", content: "Profile — FUD Markets" },
      {
        property: "og:description",
        content: "Your identity, open positions, settled bets and balances on FUD Markets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const [createOpen, setCreateOpen] = useState(false);

  const open = POSITIONS.filter((p) => p.status === "open");
  const settled = POSITIONS.filter((p) => p.status !== "open");
  const exposure = open.reduce((sum, p) => sum + p.stake, 0);

  return (
    <>
      <TopBar />
      <Page>
        <h1 className="text-2xl font-bold">Profile</h1>

        <section className="mt-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <img
              src="/profile-avatar.svg"
              alt="degen.base.eth profile"
              className="size-16 shrink-0 rounded-full border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold">degen.base.eth</h2>
              <p className="text-sm text-muted-foreground">@degen · {WALLET.address}</p>
              <p className="mt-2 text-sm">Crypto calls, onchain receipts.</p>
            </div>
          </div>
        </section>

        <Section title="Portfolio" />

        <div className="grid grid-cols-2 gap-3">
          <Stat label="USDC" value={WALLET.usdc.toFixed(2)} />
          <Stat label="FUDCOIN" value={WALLET.fud.toLocaleString("en-US")} accent />
        </div>
        <div className="mt-3 rounded-2xl border border-border p-4">
          <div className="text-xs text-muted-foreground">Open exposure</div>
          <div className="num mt-1 text-xl font-bold">{formatUsd(exposure)}</div>
        </div>

        <Section title="Open positions" />
        <div className="space-y-2">
          {open.map((p) => (
            <PositionRow key={p.id} position={p} />
          ))}
        </div>

        <Section title="Settled" />
        <div className="space-y-2">
          {settled.map((p) => (
            <PositionRow key={p.id} position={p} />
          ))}
        </div>
      </Page>
      <BottomNav onCreate={() => setCreateOpen(true)} />
      <CreateMarketModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function Section({ title }: { title: string }) {
  return <h2 className="mt-6 mb-2 text-sm font-bold">{title}</h2>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${accent ? "border-primary bg-accent" : "border-border"}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="num mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function PositionRow({ position }: { position: (typeof POSITIONS)[number] }) {
  const market = MARKETS.find((m) => m.id === position.marketId);
  if (!market) return null;
  const isUp = position.side === "up";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
      <TokenAvatar ticker={market.ticker} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          ${market.ticker}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isUp ? "bg-up-soft text-up" : "bg-down-soft text-down"
            }`}
          >
            {isUp ? "UP" : "DOWN"}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
            {market.interval}
          </span>
        </div>
        <div className="num mt-0.5 text-[11px] text-muted-foreground">
          {position.stake} {position.currency} @ {position.entryOdds.toFixed(2)}x
        </div>
      </div>
      <div
        className={`num text-sm font-bold ${
          position.status === "won"
            ? "text-up"
            : position.status === "lost"
              ? "text-down"
              : "text-foreground"
        }`}
      >
        {position.status === "won"
          ? `+${(position.stake * (position.entryOdds - 1)).toFixed(0)}`
          : position.status === "lost"
            ? `-${position.stake}`
            : `${(position.stake * position.entryOdds).toFixed(0)}`}
      </div>
    </div>
  );
}
