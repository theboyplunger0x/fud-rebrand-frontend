import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Eye,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

import { BottomNav, Page, TopBar } from "@/components/app-shell";
import { CreateMarketModal } from "@/components/create-market-modal";
import { ProfileAvatar } from "@/components/profile-avatar";
import { TokenAvatar } from "@/components/market-card";
import { MARKETS, formatUsd, sideOdds } from "@/lib/markets";
import { getPublicProfile } from "@/lib/profiles";

export const Route = createFileRoute("/profile/$username")({
  loader: ({ params }) => {
    const profile = getPublicProfile(params.username);
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.displayName} — FUD Profile` : "FUD Profile" },
      {
        name: "description",
        content: loaderData?.bio ?? "A public trader profile on FUD Markets.",
      },
    ],
  }),
  component: PublicProfilePage,
});

type ProfileTab = "positions" | "activity";
type ChartPeriod = "1W" | "1M" | "ALL";

function PublicProfilePage() {
  const profile = Route.useLoaderData();
  const [tab, setTab] = useState<ProfileTab>("positions");
  const [period, setPeriod] = useState<ChartPeriod>("1M");
  const [createOpen, setCreateOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const openedMarkets = MARKETS.filter((market) => market.createdBy === profile.username);
  const positions =
    profile.positions.length > 0
      ? profile.positions
      : openedMarkets.map((market) => ({
          id: `${profile.username}-${market.id}`,
          ticker: market.ticker,
          question: market.question,
          side: market.openerSide,
          amount: Math.round((market.openerSide === "up" ? market.upPool : market.downPool) / 8),
          entryOdds: sideOdds(market, market.openerSide),
          status: "open" as const,
          pnl: 0,
          message: market.message,
        }));

  return (
    <>
      <TopBar />
      <Page>
        <div className="mb-4 flex items-center gap-3">
          <Link
            to="/markets"
            className="flex size-9 items-center justify-center rounded-full bg-secondary"
            aria-label="Back to markets"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold">Public profile</h1>
        </div>

        <section className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start gap-4">
            <ProfileAvatar username={profile.username} size={68} className="border border-border" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-bold">{profile.displayName}</h2>
                    <a
                      href={`https://x.com/${profile.xUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-secondary-foreground"
                    >
                      𝕏 @{profile.xUsername}
                    </a>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">@{profile.username}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={isFollowing}
                  onClick={() => setIsFollowing((following) => !following)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                    isFollowing ? "bg-secondary text-secondary-foreground" : "fud-glass-primary"
                  }`}
                >
                  {isFollowing ? (
                    <UserCheck className="size-3.5" />
                  ) : (
                    <UserPlus className="size-3.5" />
                  )}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
              <p className="mt-2 text-sm leading-snug">{profile.bio}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" /> Joined {profile.joined}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" /> {profile.views} views
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Users className="size-3" />
              {(profile.followers + (isFollowing ? 1 : 0)).toLocaleString("en-US")} followers
            </span>
          </div>
        </section>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ProfileMetric label="Position value" value={formatUsd(profile.positionsValue)} />
          <ProfileMetric label="Biggest win" value={formatUsd(profile.biggestWin)} />
          <ProfileMetric label="Predictions" value={profile.predictions.toString()} />
        </div>

        <section className="mt-3 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BarChart3 className="size-3.5 text-up" /> P&amp;L
              </div>
              <div
                className={`num mt-1 text-2xl font-bold ${profile.pnl >= 0 ? "text-up" : "text-down"}`}
              >
                {profile.pnl >= 0 ? "+" : "-"}${Math.abs(profile.pnl).toLocaleString("en-US")}
              </div>
            </div>
            <div className="flex rounded-xl bg-secondary p-1">
              {(["1W", "1M", "ALL"] as ChartPeriod[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-bold ${
                    period === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <MiniPnlChart period={period} positive={profile.pnl >= 0} />
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-muted-foreground">
              Win rate <b className="text-foreground">{profile.winRate}%</b>
            </span>
            <span className="text-muted-foreground">
              Volume <b className="text-foreground">{formatUsd(profile.volume)}</b>
            </span>
          </div>
        </section>

        <div className="mt-6 flex gap-5 border-b border-border">
          <ProfileTabButton active={tab === "positions"} onClick={() => setTab("positions")}>
            Positions
          </ProfileTabButton>
          <ProfileTabButton active={tab === "activity"} onClick={() => setTab("activity")}>
            Activity
          </ProfileTabButton>
        </div>

        {tab === "positions" ? (
          <div className="mt-3 space-y-2">
            {positions.map((position) => (
              <article
                key={position.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <TokenAvatar ticker={position.ticker} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{position.question}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <span className={position.side === "up" ? "text-up" : "text-down"}>
                      {position.side === "up" ? "▲ UP" : "▼ DOWN"}
                    </span>
                    <span className="num text-muted-foreground">
                      {position.amount} USDC @ {position.entryOdds.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <span
                  className={`num text-xs font-bold ${
                    position.status === "won"
                      ? "text-up"
                      : position.status === "lost"
                        ? "text-down"
                        : "text-muted-foreground"
                  }`}
                >
                  {position.status === "open"
                    ? "OPEN"
                    : `${position.pnl >= 0 ? "+" : "-"}${formatUsd(Math.abs(position.pnl))}`}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {openedMarkets.map((market) => (
              <Link
                key={market.id}
                to="/market/$marketId"
                params={{ marketId: market.id }}
                className="block rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Trophy className="size-3.5" /> Opened ${market.ticker} · {market.interval}
                  <ArrowUpRight className="ml-auto size-3.5" />
                </div>
                <p className="mt-2 text-sm">“{market.message}”</p>
              </Link>
            ))}
          </div>
        )}
      </Page>

      <BottomNav onCreate={() => setCreateOpen(true)} />
      <CreateMarketModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="num text-sm font-bold">{value}</div>
      <div className="mt-1 text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function ProfileTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 pb-2 text-sm font-bold ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function MiniPnlChart({ period, positive }: { period: ChartPeriod; positive: boolean }) {
  const paths: Record<ChartPeriod, string> = {
    "1W": "M0 72 C35 68 48 32 82 39 S137 68 168 42 S221 19 255 36 S300 26 320 12",
    "1M": "M0 78 C34 52 58 38 88 44 S132 58 161 38 S205 72 233 54 S278 18 320 25",
    ALL: "M0 80 C25 65 43 72 68 50 S108 25 138 42 S176 62 205 36 S258 52 286 20 S309 11 320 16",
  };
  const color = positive ? "var(--color-up)" : "var(--color-down)";

  return (
    <svg
      viewBox="0 0 320 92"
      className="mt-4 h-24 w-full"
      preserveAspectRatio="none"
      aria-label="P&L chart"
    >
      <path d={`${paths[period]} L320 92 L0 92 Z`} fill={color} opacity="0.1" />
      <path d={paths[period]} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
