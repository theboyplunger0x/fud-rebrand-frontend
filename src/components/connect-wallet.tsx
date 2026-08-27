import { useState } from "react";
import { Copy, LogOut, Mail, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet, type WalletProvider } from "@/lib/wallet";

const OPTIONS: Array<{ id: WalletProvider; label: string; hint: string }> = [
  { id: "coinbase", label: "Coinbase Wallet", hint: "Recommended on Base" },
  { id: "metamask", label: "MetaMask", hint: "Browser extension" },
  { id: "walletconnect", label: "WalletConnect", hint: "Scan with any wallet" },
];

export function ConnectWalletDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { connect } = useWallet();
  const [email, setEmail] = useState("");

  function handle(provider: WalletProvider, label?: string) {
    connect(provider, label);
    onOpenChange(false);
    toast.success("Wallet connected", { description: "You're trading on Base." });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Connect wallet</DialogTitle>
          <DialogDescription>Sign in to open markets and take positions on FUD.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => handle(o.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors active:bg-muted"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
                <Wallet className="size-4 text-primary" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-[11px] text-muted-foreground">{o.hint}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-semibold text-muted-foreground">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-input px-3">
            <Mail className="size-4 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <button
            onClick={() =>
              email.includes("@") ? handle("email", email) : toast.error("Enter a valid email")
            }
            className="fud-glass-primary rounded-xl px-4 text-sm font-semibold"
          >
            Go
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Smart wallet powered by Base. No seed phrase required.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function WalletAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { address, usdc, fud, disconnect } = useWallet();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Your wallet</DialogTitle>
          <DialogDescription>Connected on Base mainnet.</DialogDescription>
        </DialogHeader>

        <button
          onClick={() => toast.success("Address copied")}
          className="flex w-full items-center gap-2 rounded-xl border border-border p-3 text-left"
        >
          <span className="num flex-1 text-sm font-semibold">{address}</span>
          <Copy className="size-4 text-muted-foreground" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border p-3">
            <div className="text-[11px] text-muted-foreground">USDC</div>
            <div className="num text-lg font-bold">{usdc.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-primary bg-accent p-3">
            <div className="text-[11px] text-muted-foreground">FUDCOIN</div>
            <div className="num text-lg font-bold">{fud.toLocaleString("en-US")}</div>
          </div>
        </div>

        <button
          onClick={() => {
            disconnect();
            onOpenChange(false);
            toast("Wallet disconnected");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold"
        >
          <LogOut className="size-4" />
          Disconnect
        </button>
      </DialogContent>
    </Dialog>
  );
}
