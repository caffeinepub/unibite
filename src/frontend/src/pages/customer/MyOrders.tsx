import {
  CheckCircle,
  Clock,
  Coins,
  IndianRupee,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import { useOrders } from "../../hooks/useStore";
import type { Order, Session } from "../../store/types";

interface MyOrdersPageProps {
  session: Session;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  PENDING_REDEEM_APPROVAL: {
    label: "Pending Redeem Approval",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: <Clock className="w-3 h-3" />,
  },
  Confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Truck className="w-3 h-3" />,
  },
  Delivered: {
    label: "Delivered",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Truck className="w-3 h-3" />,
  },
};

function DeliveryProgressBar({ status }: { status: string }) {
  const stages = ["Confirmed", "OUT_FOR_DELIVERY", "Delivered"];
  const currentIdx = stages.indexOf(status);

  return (
    <div className="mt-3">
      <div className="flex items-start justify-between mb-2">
        {["Preparing", "Out for Delivery", "Delivered"].map((label, idx) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                idx <= currentIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {idx < currentIdx ? "✓" : idx + 1}
            </div>
            <span
              className={`text-[10px] mt-1 text-center leading-tight ${
                idx <= currentIdx
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 bg-muted rounded-full mx-3">
        <div
          className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-700"
          style={{
            width: `${currentIdx < 0 ? 0 : (currentIdx / (stages.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isDelivery = order.deliveryType === "room";
  const status = statusConfig[order.status] ?? {
    label: order.status,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <Clock className="w-3 h-3" />,
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
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
              <span className="text-xs font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Token #{order.token}
              </span>
            )}
            {order.priorityCustomer && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium border border-yellow-200">
                ⭐ Priority
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            #{order.id.slice(0, 12)}...
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Delivery Type Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {isDelivery ? (
          <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3" /> Room Delivery
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            🏃 Self Pickup
          </span>
        )}
        {order.peakApplied && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            🔴 Peak Pricing
          </span>
        )}
      </div>

      {/* Delivery Info */}
      {isDelivery && (
        <div className="bg-orange-50 rounded-xl p-2.5 space-y-1 text-xs border border-orange-100">
          {order.deliveryRoom && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" /> Room:{" "}
              <span className="font-medium text-foreground">
                {order.deliveryRoom}
              </span>
            </div>
          )}
          {order.estimatedTime && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" /> Est. Time:{" "}
              <span className="font-medium text-foreground">
                {order.estimatedTime} mins
              </span>
            </div>
          )}
          {order.assignedStaff && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Truck className="w-3 h-3" /> Staff:{" "}
              <span className="font-medium text-foreground">
                {order.assignedStaff}
              </span>
            </div>
          )}
          {order.deliveryCharge !== undefined && order.deliveryCharge > 0 && (
            <div className="text-muted-foreground">
              Delivery Charge:{" "}
              <span className="font-medium text-foreground">
                ₹{order.deliveryCharge}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {order.status === "Confirmed" && !isDelivery && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700 text-sm font-medium">
            🟢 Your order is being prepared.
          </span>
        </div>
      )}
      {order.status === "Confirmed" && isDelivery && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <Truck className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span className="text-orange-700 text-sm font-medium">
            🟠 Preparing your order for delivery to {order.deliveryRoom} 🚚
          </span>
        </div>
      )}
      {order.status === "OUT_FOR_DELIVERY" && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <Truck className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span className="text-orange-700 text-sm font-medium">
            🚚 Out for Delivery – {order.assignedStaff ?? "Staff"} is on the way
          </span>
        </div>
      )}
      {order.status === "Delivered" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700 text-sm font-medium">
            ✅ Order Delivered!
          </span>
        </div>
      )}

      {/* Delivery Progress Bar */}
      {isDelivery &&
        ["Confirmed", "OUT_FOR_DELIVERY", "Delivered"].includes(
          order.status,
        ) && <DeliveryProgressBar status={order.status} />}

      {/* Items */}
      <div className="space-y-1">
        {order.items.map((item, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: order items have no stable id
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name} × {item.quantity}
              {item.selectedAddOns.length > 0 && (
                <span className="text-[11px]">
                  {" "}
                  (+{item.selectedAddOns.map((a) => a.name).join(", ")})
                </span>
              )}
            </span>
            {order.type === "Money" ? (
              <span className="font-medium">
                ₹
                {(item.price +
                  item.selectedAddOns.reduce((s, a) => s + a.price, 0)) *
                  item.quantity}
              </span>
            ) : (
              <span className="font-medium text-amber-600">
                {(item.coinCost || 0) * item.quantity} coins
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {order.type === "Money" && order.totalAmount && (
          <p className="font-bold text-primary text-sm">₹{order.totalAmount}</p>
        )}
        {order.type === "Coin" && order.totalCoins && (
          <p className="font-bold text-amber-600 text-sm flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            {order.totalCoins} coins
          </p>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage({ session }: MyOrdersPageProps) {
  const { orders } = useOrders(session.userId);

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="font-heading font-bold text-lg text-muted-foreground">
          No orders yet
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your order history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 animate-fade-in">
      <h2 className="font-heading font-bold text-lg">My Orders</h2>
      {sorted.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
