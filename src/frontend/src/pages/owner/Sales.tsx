import {
  CheckCircle,
  Coins,
  IndianRupee,
  MapPin,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authStore } from "../../store/authStore";
import { ordersStore } from "../../store/ordersStore";
import type { Order } from "../../store/types";

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>(() =>
    ordersStore.getSalesOrders(),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_orders")
        setOrders(ordersStore.getSalesOrders());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalRevenue = sorted
    .filter((o) => o.type === "Money")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalCoinOrders = sorted.filter((o) => o.type === "Coin").length;
  const totalDeliveryRevenue = sorted.reduce(
    (sum, o) => sum + (o.deliveryCharge || 0),
    0,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl">Sales</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Read-only view of all completed orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-primary">
            {sorted.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-green-600">
            ₹{totalRevenue}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Revenue</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-amber-600">
            {totalCoinOrders}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Coin Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-orange-600">
            ₹{totalDeliveryRevenue}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Delivery Revenue
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-semibold text-muted-foreground">No sales yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Approved and delivered orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => {
            const user = authStore.getUserById(order.customerId);
            const isDelivery = order.deliveryType === "room";
            const itemsSubtotal = order.items.reduce(
              (s, i) =>
                s +
                (i.price +
                  i.selectedAddOns.reduce((as, a) => as + a.price, 0)) *
                  i.quantity,
              0,
            );
            const finalAmount = itemsSubtotal + (order.deliveryCharge || 0);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-border shadow-card p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
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
                      {order.priorityCustomer && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          ⭐ Priority
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          order.status === "Delivered"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : order.status === "OUT_FOR_DELIVERY"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {order.status === "Delivered" ? (
                          <Truck className="w-2.5 h-2.5" />
                        ) : (
                          <CheckCircle className="w-2.5 h-2.5" />
                        )}
                        {order.status === "OUT_FOR_DELIVERY"
                          ? "Out for Delivery"
                          : order.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mb-2">
                      #{order.id}
                    </p>

                    {/* Delivery Info Row */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isDelivery
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {isDelivery ? "🚚 Room Delivery" : "🏃 Self Pickup"}
                      </span>
                      {isDelivery && order.deliveryRoom && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{" "}
                          {order.deliveryRoom}
                        </span>
                      )}
                      {isDelivery && order.peakApplied && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          🔴 Peak
                        </span>
                      )}
                      {isDelivery && order.assignedStaff && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />{" "}
                          {order.assignedStaff}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: order items have no stable id
                        <p key={idx} className="text-xs text-muted-foreground">
                          {item.name} × {item.quantity}
                          {item.selectedAddOns.length > 0 &&
                            ` (+${item.selectedAddOns.map((a) => a.name).join(", ")})`}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    {order.type === "Money" && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Items: ₹{itemsSubtotal}
                        </p>
                        {isDelivery && order.deliveryCharge !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Delivery: ₹{order.deliveryCharge}
                            {order.peakApplied && " 🔴"}
                          </p>
                        )}
                        <p className="font-bold text-primary text-lg">
                          ₹{finalAmount}
                        </p>
                      </>
                    )}
                    {order.type === "Coin" && order.totalCoins && (
                      <p className="font-bold text-amber-600 flex items-center gap-1 justify-end">
                        <Coins className="w-4 h-4" />
                        {order.totalCoins}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
