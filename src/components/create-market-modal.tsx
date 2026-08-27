import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FEE_BY_CURRENCY, WALLET, type Currency, type Interval } from "@/lib/markets";

const INTERVALS: Interval[] = ["6h", "12h", "24h"];
const SUGGESTIONS = ["BTC", "ETH", "SOL", "DEGEN", "HYPE", "ZORA"];

export function CreateMarketModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [token, setToken] = useState("");
  const [interval, setInterval] = useState<Interval>("24h");
  const [currency, setCurrency] = useState<Currency>("FUD");
  const [seed, setSeed] = useState("25");
  const [thesis, setThesis] = useState("");

  const stake = Number(seed) || 0;
  const fee = stake * FEE_BY_CURRENCY[currency];

  function submit() {
    if (!token.trim()) {
      toast.error("Enter a ticker or contract address");
      return;
    }
    toast.success(`Market opened for $${token.replace("$", "").toUpperCase()} · ${interval}`, {
      description: `Seeded with ${stake} ${currency}${fee ? ` · ${fee.toFixed(2)} ${currency} fee` : " · no fee"}`,
    });
    onOpenChange(false);
    setToken("");
    setThesis("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">New market</DialogTitle>
          <DialogDescription>
            Pick a token and a window. Anyone can take the other side.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="$TICKER or 0xcontract…"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setToken(s)}
                  className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                >
                  ${s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Window</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {INTERVALS.map((i) => (
                <button
                  key={i}
                  onClick={() => setInterval(i)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                    interval === i
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Pay with</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <PayOption
                active={currency === "USDC"}
                onClick={() => setCurrency("USDC")}
                title="USDC"
                sub="5% fee"
                balance={`${WALLET.usdc.toFixed(2)} available`}
              />
              <PayOption
                active={currency === "FUD"}
                onClick={() => setCurrency("FUD")}
                title="FUDCOIN"
                sub="0% fee"
                balance={`${WALLET.fud.toLocaleString("en-US")} available`}
                highlight
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Seed liquidity</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-input px-3">
              <input
                value={seed}
                inputMode="decimal"
                onChange={(e) => setSeed(e.target.value.replace(/[^0-9.]/g, ""))}
                className="num w-full bg-transparent py-3 text-lg font-semibold outline-none"
              />
              <span className="text-xs font-semibold text-muted-foreground">{currency}</span>
            </div>
            <p className="num mt-1.5 text-[11px] text-muted-foreground">
              Fee {fee.toFixed(2)} {currency} · You seed both sides evenly
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Thesis (optional)</label>
            <input
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="why is this going up?"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <button
            onClick={submit}
            className="fud-glass-primary w-full rounded-full py-3.5 text-sm font-semibold active:opacity-80"
          >
            Open market
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PayOption({
  active,
  onClick,
  title,
  sub,
  balance,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  balance: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border p-3 text-left transition-colors ${
        active ? "border-primary bg-accent" : "border-border bg-background"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {highlight ? <Zap className="size-3.5 text-primary" /> : null}
        <span className="text-sm font-bold">{title}</span>
        {active ? <Check className="ml-auto size-4 text-primary" /> : null}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold text-primary">{sub}</div>
      <div className="num mt-0.5 text-[10px] text-muted-foreground">{balance}</div>
    </button>
  );
}
