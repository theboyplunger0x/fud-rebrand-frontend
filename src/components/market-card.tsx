import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, Clock, Users } from "lucide-react";
import { ProfileAvatar } from "@/components/profile-avatar";
import { formatCountdown, formatUsd, upChance, type Market } from "@/lib/markets";

export function TokenAvatar({ ticker, size = 40 }: { ticker: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-secondary-foreground"
      style={{ width: size, height: size }}
    >
      {ticker.slice(0, 3)}
    </span>
  );
}

export function OddsBar({ chance }: { chance: number }) {
  const pct = Math.round(chance * 100);
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-down/25">
      <div className="h-full rounded-full bg-up" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function MarketCard({ market }: { market: Market }) {
  const chance = upChance(market);
  const pct = Math.round(chance * 100);
  const pool = market.upPool + market.downPool;

  const marketLink = {
    to: "/market/$marketId" as const,
    params: { marketId: market.id },
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-colors active:bg-muted">
      <Link {...marketLink} className="block p-4 pb-3">
        <div className="flex items-start gap-3">
          <TokenAvatar ticker={market.ticker} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">${market.ticker}</span>
              {market.verified ? <BadgeCheck className="size-3.5 text-primary" /> : null}
              <span className="ml-auto num text-sm font-semibold">{formatUsd(market.price)}</span>
            </div>
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{market.question}</p>
          </div>
        </div>
      </Link>

      <Link
        to="/profile/$username"
        params={{ username: market.createdBy }}
        className="mx-4 mb-3 flex items-start gap-2.5 rounded-xl bg-secondary/70 p-3 transition-colors hover:bg-secondary"
        aria-label={`View ${market.createdBy}'s public profile`}
      >
        <ProfileAvatar username={market.createdBy} size={34} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold">{market.createdBy}</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">
              OPENER
            </span>
            <span
              className={`ml-auto text-[9px] font-bold ${
                market.openerSide === "up" ? "text-up" : "text-down"
              }`}
            >
              {market.openerSide === "up" ? "▲ UP" : "▼ DOWN"}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug font-medium text-foreground/80">
            “{market.message}”
          </p>
        </div>
      </Link>

      <Link {...marketLink} className="block px-4 pb-4">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-up">UP {pct}%</span>
          <span className="text-down">DOWN {100 - pct}%</span>
        </div>
        <div className="mt-1.5">
          <OddsBar chance={chance} />
        </div>

        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">
            {market.interval}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatCountdown(market.minutesLeft)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {market.traders}
          </span>
          <span className="num ml-auto font-medium text-foreground">{formatUsd(pool)} pool</span>
        </div>

        <div
          className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${
            market.change24h >= 0 ? "text-up" : "text-down"
          }`}
        >
          {market.change24h >= 0 ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          <span className="num">{Math.abs(market.change24h).toFixed(2)}% 24h</span>
        </div>
      </Link>
    </article>
  );
}
