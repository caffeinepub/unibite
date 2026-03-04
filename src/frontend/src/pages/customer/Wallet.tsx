import { Button } from "@/components/ui/button";
import { Calendar, Clock, Coins } from "lucide-react";
import { useState } from "react";
import SubscriptionFlow from "../../components/customer/SubscriptionFlow";
import { useCustomerCoins } from "../../hooks/useStore";
import type { Session } from "../../store/types";

interface WalletPageProps {
  session: Session;
}

function getExpiryCountdown(expiryDate?: string): string {
  if (!expiryDate) return "No active coins";
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

export default function WalletPage({ session }: WalletPageProps) {
  const { coins, pendingCoins } = useCustomerCoins(session.userId);
  const [showSubscription, setShowSubscription] = useState(false);

  const expiryText = getExpiryCountdown(coins.expiryDate);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg">My Wallet</h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-orange">
        <p className="text-xs font-semibold opacity-80 mb-1">
          Usable Coin Balance
        </p>
        <div className="flex items-end gap-2 mb-3">
          <Coins className="w-8 h-8 mb-1" />
          <span className="text-4xl font-heading font-bold">
            {coins.balance}
          </span>
          <span className="text-sm opacity-80 mb-1">coins</span>
        </div>

        <div className="flex gap-4 flex-wrap">
          {pendingCoins > 0 && (
            <div className="bg-white/20 rounded-xl px-3 py-2">
              <p className="text-[10px] opacity-80">Pending</p>
              <p className="font-bold text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingCoins} coins
              </p>
            </div>
          )}
          <div className="bg-white/20 rounded-xl px-3 py-2">
            <p className="text-[10px] opacity-80">Expiry</p>
            <p className="font-bold text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {expiryText}
            </p>
          </div>
        </div>
      </div>

      {/* Buy Coins Button */}
      <Button
        onClick={() => setShowSubscription(true)}
        className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 shadow-orange"
      >
        <Coins className="w-4 h-4 mr-2" />
        Buy More Coins
      </Button>

      {/* Transaction History */}
      <div>
        <h3 className="font-heading font-semibold text-sm mb-3">
          Transaction History
        </h3>
        {coins.history.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-border">
            <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coins.history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-border p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {entry.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`font-bold text-sm flex items-center gap-1 ${
                    entry.type === "Credit" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {entry.type === "Credit" ? "+" : "-"}
                  <Coins className="w-3.5 h-3.5" />
                  {entry.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSubscription && (
        <SubscriptionFlow
          session={session}
          onClose={() => setShowSubscription(false)}
        />
      )}
    </div>
  );
}
