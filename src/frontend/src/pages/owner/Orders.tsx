import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Coins,
  IndianRupee,
  MapPin,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authStore } from "../../store/authStore";
import { coinsStore } from "../../store/coinsStore";
import { getDeliverySettings } from "../../store/deliveryStore";
import { ordersStore } from "../../store/ordersStore";
import type { Order } from "../../store/types";

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const aScore =
      (a.deliveryType === "room" ? 100 : 0) + (a.priorityCustomer ? 50 : 0);
    const bScore =
      (b.deliveryType === "room" ? 100 : 0) + (b.priorityCustomer ? 50 : 0);
    if (bScore !== aScore) return bScore - aScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(() =>
    ordersStore.getActiveOrders(),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_orders")
        setOrders(ordersStore.getActiveOrders());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = () => setOrders(ordersStore.getActiveOrders());

  const handleApprovePaid = (order: Order) => {
    const ds = getDeliverySettings();
    let assignedStaff: string | undefined;
    if (order.deliveryType === "room" && ds.staff.length > 0) {
      assignedStaff = ds.staff[Math.floor(Math.random() * ds.staff.length)];
    }
    ordersStore.approveOrder(order.id, assignedStaff);
    refresh();
    const user = authStore.getUserById(order.customerId);
    toast.success(
      `Order approved! Token generated for ${user?.name || "customer"}.`,
    );
  };

  const handleApproveRedeem = (order: Order) => {
    const totalCoins = order.totalCoins || 0;
    const ds = getDeliverySettings();
    let assignedStaff: string | undefined;
    if (order.deliveryType === "room" && ds.staff.length > 0) {
      assignedStaff = ds.staff[Math.floor(Math.random() * ds.staff.length)];
    }
    const deducted = coinsStore.deductCoins(
      order.customerId,
      totalCoins,
      `Redeemed: ${order.items.map((i) => i.name).join(", ")}`,
    );
    if (!deducted) {
      toast.error("Insufficient coins in customer wallet.");
      return;
    }
    ordersStore.approveOrder(order.id, assignedStaff);
    refresh();
    const user = authStore.getUserById(order.customerId);
    toast.success(
      `Redemption approved! ${totalCoins} coins deducted from ${user?.name || "customer"}.`,
    );
  };

  const handleMarkOutForDelivery = (order: Order) => {
    ordersStore.markOutForDelivery(order.id);
    refresh();
    toast.success("Order marked as out for delivery!");
  };

  const handleMarkDelivered = (order: Order) => {
    ordersStore.markDelivered(order.id);
    refresh();
    toast.success("Order marked as delivered!");
  };

  const sorted = sortOrders(orders);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sorted.length} active order{sorted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-semibold text-muted-foreground">
            No active orders
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            New orders will appear here for approval.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const user = authStore.getUserById(order.customerId);
            const isDelivery = order.deliveryType === "room";
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-border shadow-card p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">
                        {user?.name || "Unknown"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          order.type === "Money"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {order.type === "Money" ? (
                          <IndianRupee className="w-2.5 h-2.5" />
                        ) : (
                          <Coins className="w-2.5 h-2.5" />
                        )}
                        {order.type}
                      </span>
                      {order.token && (
                        <span className="text-[10px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                          Token #{order.token}
                        </span>
                      )}
                      {isDelivery && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                          <Truck className="w-2.5 h-2.5" /> Delivery
                        </span>
                      )}
                      {order.priorityCustomer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          ⭐ Priority
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      #{order.id}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${
                      order.status === "PENDING_VERIFICATION"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : order.status === "PENDING_REDEEM_APPROVAL"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : order.status === "OUT_FOR_DELIVERY"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-green-100 text-green-700 border-green-200"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {order.status === "PENDING_VERIFICATION"
                      ? "Pending Verification"
                      : order.status === "PENDING_REDEEM_APPROVAL"
                        ? "Pending Redeem"
                        : order.status === "OUT_FOR_DELIVERY"
                          ? "Out for Delivery"
                          : "Confirmed"}
                  </span>
                </div>

                {/* Delivery Info */}
                {isDelivery && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3 space-y-1 text-xs">
                    {order.deliveryRoom && (
                      <div className="flex items-center gap-1 text-orange-700">
                        <MapPin className="w-3 h-3" /> Room:{" "}
                        <span className="font-bold">{order.deliveryRoom}</span>
                      </div>
                    )}
                    {order.deliveryCharge !== undefined && (
                      <div className="flex items-center gap-1 text-orange-700">
                        💰 Delivery Charge:{" "}
                        <span className="font-bold">
                          ₹{order.deliveryCharge}
                        </span>
                        {order.peakApplied && (
                          <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                            🔴 Peak
                          </span>
                        )}
                      </div>
                    )}
                    {order.estimatedTime && (
                      <div className="flex items-center gap-1 text-orange-700">
                        <Clock className="w-3 h-3" /> Est. Time:{" "}
                        <span className="font-bold">
                          {order.estimatedTime} mins
                        </span>
                      </div>
                    )}
                    {order.assignedStaff && (
                      <div className="flex items-center gap-1 text-orange-700">
                        <Users className="w-3 h-3" /> Staff:{" "}
                        <span className="font-bold">{order.assignedStaff}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="bg-secondary rounded-xl p-3 mb-3 space-y-1">
                  {order.items.map((item, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: no stable item id in order snapshot
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                        {item.selectedAddOns.length > 0 && (
                          <span className="text-[11px]">
                            {" "}
                            (+
                            {item.selectedAddOns.map((a) => a.name).join(", ")})
                          </span>
                        )}
                      </span>
                      {order.type === "Money" ? (
                        <span className="font-medium">
                          ₹
                          {(item.price +
                            item.selectedAddOns.reduce(
                              (s, a) => s + a.price,
                              0,
                            )) *
                            item.quantity}
                        </span>
                      ) : (
                        <span className="font-medium text-amber-600">
                          {(item.coinCost || 0) * item.quantity} coins
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between font-bold text-sm">
                    <span>Total</span>
                    {order.type === "Money" ? (
                      <span className="text-primary">₹{order.totalAmount}</span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {order.totalCoins} coins
                      </span>
                    )}
                  </div>
                </div>

                {/* Transaction ID */}
                {order.transactionId && (
                  <div className="mb-3 p-2.5 bg-orange-50 rounded-xl border border-orange-200">
                    <p className="text-[10px] text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      {order.transactionId}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {order.status === "PENDING_VERIFICATION" && (
                    <Button
                      size="sm"
                      onClick={() => handleApprovePaid(order)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve Paid
                    </Button>
                  )}
                  {order.status === "PENDING_REDEEM_APPROVAL" && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveRedeem(order)}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-1.5 text-xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Approve Redeem
                    </Button>
                  )}
                  {order.status === "Confirmed" && isDelivery && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkOutForDelivery(order)}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-1.5 text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Mark Out for Delivery
                    </Button>
                  )}
                  {(order.status === "Confirmed" ||
                    order.status === "OUT_FOR_DELIVERY") && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkDelivered(order)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
