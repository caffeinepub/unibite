import { generateOrderId, getNextToken } from "../utils/idGenerator";
import {
  type Order,
  type OrderItem,
  OrderStatus,
  type OrderType,
} from "./types";

const STORAGE_KEY = "unibite_orders";

function loadState(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    // ignore
  }
  return [];
}

function saveState(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export const ordersStore = {
  getOrders(): Order[] {
    return loadState();
  },

  getOrdersByCustomer(customerId: string): Order[] {
    return loadState().filter((o) => o.customerId === customerId);
  },

  getOrderById(id: string): Order | undefined {
    return loadState().find((o) => o.id === id);
  },

  createOrder(data: {
    customerId: string;
    type: OrderType;
    items: OrderItem[];
    transactionId?: string;
    totalAmount?: number;
    totalCoins?: number;
    deliveryType?: "pickup" | "room";
    deliveryRoom?: string;
    deliveryCharge?: number;
    peakApplied?: boolean;
    estimatedTime?: number;
    priorityCustomer?: boolean;
  }): Order {
    const orders = loadState();
    const order: Order = {
      id: generateOrderId(),
      customerId: data.customerId,
      type: data.type,
      items: data.items,
      status:
        data.type === "Money"
          ? "PENDING_VERIFICATION"
          : "PENDING_REDEEM_APPROVAL",
      transactionId: data.transactionId,
      totalAmount: data.totalAmount,
      totalCoins: data.totalCoins,
      deliveryType: data.deliveryType,
      deliveryRoom: data.deliveryRoom,
      deliveryCharge: data.deliveryCharge,
      peakApplied: data.peakApplied,
      estimatedTime: data.estimatedTime,
      priorityCustomer: data.priorityCustomer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(order);
    saveState(orders);
    return order;
  },

  approveOrder(orderId: string, assignedStaff?: string): Order | undefined {
    const orders = loadState();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].token = getNextToken();
      orders[idx].status = "Confirmed";
      orders[idx].updatedAt = new Date().toISOString();
      if (assignedStaff) {
        orders[idx].assignedStaff = assignedStaff;
      }
      saveState(orders);
      return orders[idx];
    }
    return undefined;
  },

  markOutForDelivery(orderId: string): void {
    const orders = loadState();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = "OUT_FOR_DELIVERY";
      orders[idx].updatedAt = new Date().toISOString();
      saveState(orders);
    }
  },

  markDelivered(orderId: string): void {
    const orders = loadState();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = "Delivered";
      orders[idx].updatedAt = new Date().toISOString();
      saveState(orders);
    }
  },

  getPendingOrders(): Order[] {
    return loadState().filter(
      (o) =>
        o.status === "PENDING_VERIFICATION" ||
        o.status === "PENDING_REDEEM_APPROVAL",
    );
  },

  getActiveOrders(): Order[] {
    return loadState().filter(
      (o) =>
        o.status === "PENDING_VERIFICATION" ||
        o.status === "PENDING_REDEEM_APPROVAL" ||
        o.status === "Confirmed" ||
        o.status === "OUT_FOR_DELIVERY",
    );
  },

  getSalesOrders(): Order[] {
    return loadState().filter(
      (o) =>
        o.status === "Confirmed" ||
        o.status === "OUT_FOR_DELIVERY" ||
        o.status === "Delivered",
    );
  },
};
