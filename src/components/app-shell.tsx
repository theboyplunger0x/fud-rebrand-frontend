import { Link, useRouterState } from "@tanstack/react-router";
import { Copy, Home, LogOut, Moon, Plus, Sun, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ProfileAvatar } from "@/components/profile-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth";

export function BrandMark() {
  return (
    <Link to="/" aria-label="FUD home" className="block">
      <span className="relative block h-8 w-[72px] overflow-hidden dark:hidden">
        <img
          src="/fud-3d-wordmark-blue.jpg"
          alt="FUD."
          className="absolute -top-[26px] -left-[9px] w-[82px] max-w-none"
        />
      </span>
      <img src="/fud-icon.png" alt="FUD." className="hidden h-8 w-auto dark:block" />
    </Link>
  );
}

export function ConnectButton() {
  const { user, loading, login, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const address = user?.wallet_address ?? "Wallet provisioning";
  const balance = Number(user?.balance_usd ?? 0);

  return (
    <>
      {user ? (
        <div className="flex items-center gap-2">
          <div className="num rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            ${Number.isFinite(balance) ? balance.toFixed(2) : "0.00"}
          </div>
          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="num flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
          >
            <ProfileAvatar username={user.username} avatarUrl={user.avatar_url} size={20} />
            <span className="max-w-28 truncate">{user.username}</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={login}
          className="fud-glass-primary rounded-full px-4 py-2 text-xs font-semibold active:opacity-80"
        >
          {loading ? "Loading…" : "Deposit"}
        </button>
      )}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">Your FUD account</DialogTitle>
            <DialogDescription>Identity and balance shared with FUD V2.</DialogDescription>
          </DialogHeader>

          <Link
            to="/portfolio"
            onClick={() => setAccountOpen(false)}
            className="flex items-center gap-3 rounded-xl border border-border p-3"
          >
            <ProfileAvatar
              username={user?.username ?? "fud"}
              avatarUrl={user?.avatar_url}
              size={42}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{user?.username}</span>
              <span className="block text-xs text-muted-foreground">Edit profile</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              if (!user?.wallet_address) return;
              await navigator.clipboard.writeText(user.wallet_address);
              toast.success("Address copied");
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-border p-3 text-left"
          >
            <span className="num min-w-0 flex-1 truncate text-sm font-semibold">{address}</span>
            <Copy className="size-4 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={async () => {
              await logout();
              setAccountOpen(false);
              toast("Signed out");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle light or dark theme"
      className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Moon aria-hidden="true" className="size-4 dark:hidden" />
      <Sun aria-hidden="true" className="hidden size-4 dark:block" />
    </button>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <BrandMark />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ onCreate }: { onCreate: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center px-6 pb-[env(safe-area-inset-bottom)]">
        <Link to="/" className={item(pathname === "/")}>
          <Home className="size-5" />
          Markets
        </Link>
        <button onClick={onCreate} className="flex flex-1 flex-col items-center py-1.5">
          <span className="fud-glass-primary flex size-11 items-center justify-center rounded-full">
            <Plus className="size-6" />
          </span>
        </button>
        <Link to="/portfolio" className={item(pathname.startsWith("/portfolio"))}>
          <UserRound className="size-5" />
          Profile
        </Link>
      </div>
    </nav>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-2xl px-4 pt-4 pb-28">{children}</main>;
}
