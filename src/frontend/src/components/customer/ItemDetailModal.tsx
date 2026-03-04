import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cartStore } from "../../store/cartStore";
import { coinsStore } from "../../store/coinsStore";
import { ordersStore } from "../../store/ordersStore";
import type { AddOn, MenuItem, Session } from "../../store/types";

interface ItemDetailModalProps {
  item: MenuItem;
  initialRedeemMode?: boolean;
  session: Session;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export default function ItemDetailModal({
  item,
  initialRedeemMode = false,
  session,
  onClose,
  onAddedToCart,
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [redeemMode, setRedeemMode] = useState(initialRedeemMode);

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, addOn],
    );
  };

  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const total = (item.price + addOnTotal) * quantity;

  const handleAddToCart = () => {
    cartStore.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      selectedAddOns,
      imageUrl: item.imageUrl,
    });
    toast.success(`${item.name} added to cart!`);
    onClose();
    onAddedToCart?.();
  };

  const handleRedeem = () => {
    const balance = coinsStore.getBalance(session.userId);
    const cost = (item.coinCost || 0) * quantity;
    if (balance < cost) {
      toast.error(
        `Insufficient coins. You need ${cost} coins but have ${balance}.`,
      );
      return;
    }
    ordersStore.createOrder({
      customerId: session.userId,
      type: "Coin",
      items: [
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity,
          selectedAddOns,
          coinCost: item.coinCost,
        },
      ],
      totalCoins: cost,
    });
    toast.success("Redemption request submitted for approval!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative">
          <img
            src={
              item.imageUrl ||
              "/assets/generated/food-placeholder.dim_400x300.png"
            }
            alt={item.name}
            className="w-full h-52 object-cover rounded-t-3xl sm:rounded-t-2xl"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          {item.coinRedeemable && item.coinCost && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {item.coinCost} coins
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-xl">{item.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {item.description}
            </p>
            <p className="text-primary font-bold text-xl mt-2">₹{item.price}</p>
          </div>

          {/* Mode Toggle */}
          {item.coinRedeemable && (
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => setRedeemMode(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  !redeemMode
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Pay Money
              </button>
              <button
                type="button"
                onClick={() => setRedeemMode(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  redeemMode
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Use Coins
              </button>
            </div>
          )}

          {/* Add-ons */}
          {item.addOns.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Add-ons</h3>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.name}
                    htmlFor={`addon-${addOn.name}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id={`addon-${addOn.name}`}
                        checked={selectedAddOns.some(
                          (a) => a.name === addOn.name,
                        )}
                        onCheckedChange={() => toggleAddOn(addOn)}
                      />
                      <span className="text-sm font-medium">{addOn.name}</span>
                    </div>
                    <span className="text-sm text-primary font-semibold">
                      +₹{addOn.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-lg w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-orange"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="font-semibold">Total</span>
            {redeemMode ? (
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {(item.coinCost || 0) * quantity} coins
              </span>
            ) : (
              <span className="font-bold text-primary text-lg">₹{total}</span>
            )}
          </div>

          {/* Action Button */}
          {redeemMode ? (
            <Button
              onClick={handleRedeem}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Redeem with {(item.coinCost || 0) * quantity} Coins
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-3 shadow-orange flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart — ₹{total}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
