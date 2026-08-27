import { ArrowUpRight, Zap } from "lucide-react";
import { toast } from "sonner";

export function BuyFudBanner() {
  return (
    <section className="overflow-hidden rounded-3xl border border-primary bg-accent p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary">
          <Zap className="size-4 text-primary-foreground" />
        </span>
        <span className="text-xs font-bold tracking-wide text-primary uppercase">Zero fees</span>
      </div>

      <h2 className="mt-3 text-2xl leading-tight font-bold">
        Buy $FUDCOIN,
        <br />
        trade at 0% fee
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Every market settled in USDC pays a 5% fee. Hold $FUDCOIN and keep all of your winnings.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => toast.success("Swap opening", { description: "USDC → $FUDCOIN on Base" })}
          className="fud-glass-primary flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold active:opacity-80"
        >
          Buy $FUDCOIN
          <ArrowUpRight className="size-4" />
        </button>
        <a
          href="https://basescan.org"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary"
        >
          Contract
        </a>
      </div>

      <div className="num mt-5 flex gap-6 text-[11px] text-muted-foreground">
        <span>$0.0043 price</span>
        <span>$12.4M mcap</span>
        <span>+18.2% 24h</span>
      </div>
    </section>
  );
}
