import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, Page, TopBar } from "@/components/app-shell";
import { BuyFudBanner } from "@/components/buy-fud-banner";
import { CreateMarketModal } from "@/components/create-market-modal";
import { MarketCard } from "@/components/market-card";
import { MARKETS, type Interval } from "@/lib/markets";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "FUD Markets — Up or down prediction markets on Base" },
      {
        name: "description",
        content:
          "Open a 6h, 12h or 24h market on any token and bet UP or DOWN. Pay with USDC (5% fee) or FUDCOIN (0% fee).",
      },
      { property: "og:title", content: "FUD Markets — Up or down prediction markets on Base" },
      {
        property: "og:description",
        content: "Bet UP or DOWN on any token over 6h, 12h or 24h windows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FILTERS: Array<"all" | Interval> = ["all", "6h", "12h", "24h"];

function Index() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | Interval>("all");

  const markets = MARKETS.filter((m) => filter === "all" || m.interval === filter);
  const volume = MARKETS.reduce((sum, m) => sum + m.upPool + m.downPool, 0);

  return (
    <>
      <TopBar />
      <Page>
        <section className="fud-glass-hero rounded-3xl p-5">
          <h1 className="text-[26px] leading-[1.1] font-bold">
            Will it pump
            <br />
            or dump?
          </h1>
          <p className="mt-2 max-w-[24ch] text-sm opacity-85">
            Open a market on any token. 6h, 12h or 24h. Winner takes the pool.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="fud-hero-cta mt-4 rounded-full px-5 py-2.5 text-sm font-bold"
          >
            Create a market
          </button>
          <div className="num mt-5 flex gap-6 text-xs opacity-85">
            <span>${volume.toLocaleString("en-US")} open interest</span>
            <span>{MARKETS.length} live markets</span>
          </div>
        </section>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f === "all" ? "All markets" : f}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {markets.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>

        <div className="mt-6">
          <BuyFudBanner />
        </div>
      </Page>

      <BottomNav onCreate={() => setCreateOpen(true)} />
      <CreateMarketModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
