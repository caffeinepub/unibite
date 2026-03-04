import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Clock,
  Copy,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isPeakHour, useCart, useDeliverySettings } from "../../hooks/useStore";
import { cartStore } from "../../store/cartStore";
import { ordersStore } from "../../store/ordersStore";
import type { Session } from "../../store/types";

const UPI_ID = "6305506718@ptyes";

interface CartPageProps {
  session: Session;
  onOrderPlaced: () => void;
}

export default function CartPage({ session, onOrderPlaced }: CartPageProps) {
  const { items, refresh } = useCart();
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "room">("pickup");
  const [selectedRoom, setSelectedRoom] = useState("");

  const deliverySettings = useDeliverySettings();
  const peakActive = isPeakHour();

  const itemsTotal = cartStore.getTotal();
  const deliveryCharge =
    deliveryType === "room"
      ? peakActive
        ? deliverySettings.peakCharge
        : deliverySettings.baseCharge
      : 0;
  const total = itemsTotal + deliveryCharge;

  const estimatedTime =
    deliveryType === "room"
      ? peakActive
        ? deliverySettings.baseTime + 7
        : deliverySettings.baseTime
      : 0;

  const customerOrderCount = ordersStore.getOrdersByCustomer(
    session.userId,
  ).length;
  const isPriorityCustomer =
    deliverySettings.priorityEnabled && customerOrderCount >= 5;
  const priorityTimeReduction =
    isPriorityCustomer && deliveryType === "room" ? 3 : 0;
  const finalEstimatedTime = Math.max(5, estimatedTime - priorityTimeReduction);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    cartStore.updateQuantity(id, qty);
    refresh();
  };

  const handleRemove = (id: string) => {
    cartStore.removeItem(id);
    refresh();
    toast.info("Item removed from cart.");
  };

  const handleSubmitPayment = () => {
    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (deliveryType === "room") {
      if (!deliverySettings.enabled) {
        toast.error(
          "Room delivery is currently unavailable. Please choose Self Pickup.",
        );
        return;
      }
      if (!selectedRoom) {
        toast.error("Please select your room for delivery.");
        return;
      }
    }

    setSubmitting(true);
    try {
      ordersStore.createOrder({
        customerId: session.userId,
        type: "Money",
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          selectedAddOns: i.selectedAddOns,
        })),
        transactionId: transactionId.trim(),
        totalAmount: total,
        deliveryType,
        deliveryRoom: deliveryType === "room" ? selectedRoom : undefined,
        deliveryCharge: deliveryType === "room" ? deliveryCharge : 0,
        peakApplied: deliveryType === "room" ? peakActive : false,
        estimatedTime: deliveryType === "room" ? finalEstimatedTime : undefined,
        priorityCustomer: isPriorityCustomer,
      });
      cartStore.clearCart();
      refresh();
      setTransactionId("");
      setDeliveryType("pickup");
      setSelectedRoom("");
      toast.success("Order submitted! Awaiting owner verification. 🎉");
      onOrderPlaced();
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="font-heading font-bold text-lg text-muted-foreground">
          Your cart is empty
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add items from the menu to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <h2 className="font-heading font-bold text-lg">Your Cart</h2>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const addOnTotal = item.selectedAddOns.reduce(
            (s, a) => s + a.price,
            0,
          );
          const itemTotal = (item.price + addOnTotal) * item.quantity;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-card p-3 border border-border"
            >
              <div className="flex gap-3">
                <img
                  src={
                    item.imageUrl ||
                    "/assets/generated/food-placeholder.dim_400x300.png"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm truncate pr-2">
                      {item.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.selectedAddOns.length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      + {item.selectedAddOns.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full border border-primary flex items-center justify-center text-primary"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-bold text-primary text-sm">
                      ₹{itemTotal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Options */}
      <div className="bg-white rounded-2xl shadow-card p-4 border border-border space-y-3">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" /> Delivery Options
        </h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors">
            <input
              type="radio"
              name="deliveryType"
              value="pickup"
              checked={deliveryType === "pickup"}
              onChange={() => {
                setDeliveryType("pickup");
                setSelectedRoom("");
              }}
              className="accent-primary"
            />
            <div>
              <div className="font-medium text-sm">🏃 Self Pickup (Free)</div>
              <div className="text-xs text-muted-foreground">
                Pick up from the counter
              </div>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors ${!deliverySettings.enabled ? "opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="deliveryType"
              value="room"
              checked={deliveryType === "room"}
              onChange={() => setDeliveryType("room")}
              disabled={!deliverySettings.enabled}
              className="accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                🚚 Room Delivery
                <span className="text-primary font-bold">
                  + ₹
                  {peakActive
                    ? deliverySettings.peakCharge
                    : deliverySettings.baseCharge}
                </span>
                {!deliverySettings.enabled ? (
                  <Badge variant="destructive" className="text-xs">
                    Unavailable
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-green-500 text-white border-0">
                    Available
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Delivered to your room
              </div>
            </div>
          </label>
        </div>

        {/* Room Delivery Details */}
        {deliveryType === "room" && (
          <div className="space-y-3 pt-2 border-t border-border">
            {peakActive && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <span className="text-red-600 text-sm font-medium">
                  🔴 Peak Hour Delivery Charges Applied
                </span>
              </div>
            )}

            <div>
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> Select Room
              </Label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Select your room --</option>
                {deliverySettings.rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {peakActive ? (
                <span className="text-orange-600 font-medium">
                  🕒 High Demand – {finalEstimatedTime} mins
                </span>
              ) : (
                <span className="text-foreground">
                  🕒 Estimated delivery: {finalEstimatedTime} mins
                </span>
              )}
              {isPriorityCustomer && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                  ⭐ Priority
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-card p-4 border border-border">
        <h3 className="font-heading font-semibold text-sm mb-3">
          Order Summary
        </h3>
        <div className="space-y-1.5">
          {items.map((item) => {
            const addOnTotal = item.selectedAddOns.reduce(
              (s, a) => s + a.price,
              0,
            );
            return (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.price + addOnTotal) * item.quantity}</span>
              </div>
            );
          })}
          {deliveryCharge > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Delivery Charge{" "}
                {peakActive && deliveryType === "room" ? "(Peak)" : ""}
              </span>
              <span>₹{deliveryCharge}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary text-lg">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Payment Panel */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
        <h3 className="font-heading font-bold text-sm mb-3 text-primary">
          💳 Payment Details
        </h3>

        <div className="bg-white rounded-xl p-3 mb-3 border border-orange-200">
          <p className="text-xs text-muted-foreground mb-1">Pay to UPI ID:</p>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-foreground">
              {UPI_ID}
            </span>
            <button
              type="button"
              onClick={handleCopyUPI}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label
              htmlFor="txnId"
              className="text-xs font-semibold mb-1.5 block"
            >
              Transaction ID / UTR Number
            </Label>
            <Input
              id="txnId"
              placeholder="Enter transaction ID after payment"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="rounded-xl bg-white text-sm"
            />
          </div>

          <Button
            onClick={handleSubmitPayment}
            disabled={submitting || !transactionId.trim()}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-3 shadow-orange"
          >
            {submitting ? "Submitting..." : `✅ I Have Paid — ₹${total}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
