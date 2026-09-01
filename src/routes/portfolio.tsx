import { createFileRoute } from "@tanstack/react-router";
import { Camera, Pencil, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { BottomNav, Page, TopBar } from "@/components/app-shell";
import { CreateMarketModal } from "@/components/create-market-modal";
import { TokenAvatar } from "@/components/market-card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { profileApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { fileToCompressedAvatar } from "@/lib/image";
import { MARKETS, POSITIONS, formatUsd } from "@/lib/markets";

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
  const { user, loading, saving, login, saveProfile } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [fudpBalance, setFudpBalance] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?.id;

  const open = POSITIONS.filter((p) => p.status === "open");
  const settled = POSITIONS.filter((p) => p.status !== "open");
  const exposure = open.reduce((sum, p) => sum + p.stake, 0);

  useEffect(() => {
    setBioDraft(user?.bio ?? "");
    setAvatarPreview(user?.avatar_url ?? null);
    setAvatarDirty(false);
    setEditing(false);
  }, [user?.avatar_url, user?.bio, user?.id]);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setFudpBalance(null);
      return () => {
        active = false;
      };
    }
    void profileApi
      .seasonMe()
      .then((season) => {
        if (!active) return;
        const verification = season.creatorVerification ?? season.creator_verification;
        setFudpBalance(verification?.fudpBalance ?? null);
      })
      .catch(() => {
        if (active) setFudpBalance(null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  async function selectAvatar(file: File | undefined) {
    if (!file) return;
    try {
      const compressed = await fileToCompressedAvatar(file);
      setAvatarPreview(compressed);
      setAvatarDirty(true);
    } catch (avatarError) {
      toast.error(avatarError instanceof Error ? avatarError.message : "Could not use that image.");
    }
  }

  async function handleSave() {
    try {
      await saveProfile(avatarDirty ? avatarPreview : undefined, bioDraft.trim());
      toast.success("Profile updated");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not update profile.");
    }
  }

  function cancelEditing() {
    setBioDraft(user?.bio ?? "");
    setAvatarPreview(user?.avatar_url ?? null);
    setAvatarDirty(false);
    setEditing(false);
  }

  return (
    <>
      <TopBar />
      <Page>
        <h1 className="text-2xl font-bold">Profile</h1>

        <section className="mt-4 rounded-3xl border border-border bg-card p-4">
          {user ? (
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <ProfileAvatar
                  username={user.username}
                  avatarUrl={avatarPreview}
                  size={68}
                  className="border border-border"
                />
                {editing ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change profile picture"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-[2px]"
                  >
                    <Camera className="size-5" />
                  </button>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => void selectAvatar(event.target.files?.[0])}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{user.username}</h2>
                    <p className="num truncate text-xs text-muted-foreground">
                      {user.wallet_address ?? "Creating your embedded wallet…"}
                    </p>
                  </div>
                  {editing ? (
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        aria-label="Cancel profile edit"
                        className="flex size-8 items-center justify-center rounded-full border border-border"
                      >
                        <X className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleSave()}
                        className="fud-glass-primary flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold disabled:opacity-50"
                      >
                        <Save className="size-3.5" />
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-bold"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="mt-3">
                    <textarea
                      value={bioDraft}
                      onChange={(event) => setBioDraft(event.target.value)}
                      maxLength={500}
                      rows={3}
                      autoFocus
                      placeholder="Write a short bio…"
                      className="w-full resize-none rounded-xl border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="mt-1 text-right text-[10px] text-muted-foreground">
                      {bioDraft.length}/500
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-foreground/80">
                    {user.bio || "Add a bio so people know what you trade."}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Make this profile yours</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to keep your existing FUD identity, picture and balances.
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={login}
                className="fud-glass-primary shrink-0 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
              >
                {loading ? "Loading…" : "Sign in"}
              </button>
            </div>
          )}
        </section>

        <Section title="Portfolio" />

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="USDC"
            value={
              user && Number.isFinite(Number(user.balance_usd))
                ? Number(user.balance_usd).toFixed(2)
                : "—"
            }
          />
          <Stat
            label="FUDP"
            value={fudpBalance == null ? "—" : fudpBalance.toLocaleString("en-US")}
            accent
          />
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
