import { Button } from "@/components/ui/button";
import { AlertCircle, Coins } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCustomerCoins, useMenuItems } from "../../hooks/useStore";
import { ordersStore } from "../../store/ordersStore";
import type { MenuItem, Session } from "../../store/types";

interface RedeemStorePageProps {
  session: Session;
}

export default function RedeemStorePage({ session }: RedeemStorePageProps) {
  const { items } = useMenuItems();
  const { coins } = useCustomerCoins(session.userId);
  const [confirmItem, setConfirmItem] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redeemableItems = items.filter((i) => i.enabled && i.coinRedeemable);

  const handleRedeem = (item: MenuItem) => {
    const cost = item.coinCost || 0;
    if (coins.balance < cost) {
      toast.error(
        `Insufficient coins. You need ${cost} coins but have ${coins.balance}.`,
      );
      return;
    }
    setConfirmItem(item);
  };

  const handleConfirmRedeem = () => {
    if (!confirmItem) return;
    setSubmitting(true);
    try {
      ordersStore.createOrder({
        customerId: session.userId,
        type: "Coin",
        items: [
          {
            menuItemId: confirmItem.id,
            name: confirmItem.name,
            price: confirmItem.price,
            quantity: 1,
            selectedAddOns: [],
            coinCost: confirmItem.coinCost,
          },
        ],
        totalCoins: confirmItem.coinCost || 0,
      });
      toast.success("Redemption request submitted! Awaiting owner approval.");
      setConfirmItem(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (redeemableItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="font-heading font-bold text-lg text-muted-foreground">
          No redeemable items
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Check back soon for coin-redeemable items!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 animate-fade-in">
      {/* Balance Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 mb-4 text-white">
        <p className="text-xs font-semibold opacity-80">Your Coin Balance</p>
        <div className="flex items-center gap-2 mt-1">
          <Coins className="w-6 h-6" />
          <span className="text-3xl font-heading font-bold">
            {coins.balance}
          </span>
          <span className="text-sm opacity-80">coins</span>
        </div>
      </div>

      <h2 className="font-heading font-bold text-lg mb-3">🎁 Redeem Store</h2>

      <div className="grid grid-cols-2 gap-3">
        {redeemableItems.map((item) => {
          const cost = item.coinCost || 0;
          const canAfford = coins.balance >= cost;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl shadow-card border overflow-hidden transition-all ${
                canAfford ? "border-border" : "border-border opacity-70"
              }`}
            >
              <div className="relative">
                <img
                  src={
                    item.imageUrl ||
                    "/assets/generated/food-placeholder.dim_400x300.png"
                  }
                  alt={item.name}
                  className="w-full h-28 object-cover"
                />
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Coins className="w-2.5 h-2.5" />
                  {cost}
                </span>
              </div>
              <div className="p-2.5">
                <p className="font-heading font-bold text-xs truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.description}
                </p>
                <Button
                  size="sm"
                  onClick={() => handleRedeem(item)}
                  disabled={!canAfford}
                  className={`w-full mt-2 rounded-xl text-xs font-bold py-1.5 ${
                    canAfford
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {canAfford ? `Redeem (${cost} coins)` : `Need ${cost} coins`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmItem(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-heading font-bold text-lg mb-2">
              Confirm Redemption
            </h3>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl mb-4">
              <img
                src={
                  confirmItem.imageUrl ||
                  "/assets/generated/food-placeholder.dim_400x300.png"
                }
                alt={confirmItem.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{confirmItem.name}</p>
                <p className="text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                  <Coins className="w-3.5 h-3.5" />
                  {confirmItem.coinCost} coins
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4 bg-secondary rounded-xl p-3">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Coins will be deducted only after the owner approves your
                redemption request.
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmItem(null)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRedeem}
                disabled={submitting}
                className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
              >
                {submitting ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
