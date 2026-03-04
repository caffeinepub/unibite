export type UserRole = "CUSTOMER" | "OWNER";
export type UserStatus = "ACTIVE" | "OWNER_PENDING";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export type OrderStatus =
  | "PENDING_VERIFICATION"
  | "PENDING_REDEEM_APPROVAL"
  | "Confirmed"
  | "OUT_FOR_DELIVERY"
  | "Delivered";

export type OrderType = "Money" | "Coin";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedAddOns: AddOn[];
  coinCost?: number;
}

export interface Order {
  id: string;
  customerId: string;
  type: OrderType;
  token?: number;
  items: OrderItem[];
  status: OrderStatus;
  transactionId?: string;
  totalAmount?: number;
  totalCoins?: number;
  createdAt: string;
  updatedAt: string;
  // Delivery fields
  deliveryType?: "pickup" | "room";
  deliveryRoom?: string;
  deliveryCharge?: number;
  peakApplied?: boolean;
  estimatedTime?: number;
  assignedStaff?: string;
  priorityCustomer?: boolean;
}

export interface AddOn {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  addOns: AddOn[];
  coinRedeemable: boolean;
  coinCost?: number;
  enabled: boolean;
  createdAt: string;
}

export interface Combo {
  id: string;
  name: string;
  imageUrl: string;
  itemIds: string[];
  price: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedAddOns: AddOn[];
  imageUrl: string;
}

export type CoinHistoryType = "Credit" | "Debit";

export interface CoinHistoryEntry {
  id: string;
  type: CoinHistoryType;
  amount: number;
  description: string;
  date: string;
}

export interface CustomerCoins {
  customerId: string;
  balance: number;
  expiryDate?: string;
  history: CoinHistoryEntry[];
}

export type CoinRequestStatus =
  | "PENDING_COIN_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export interface CoinRequest {
  id: string;
  customerId: string;
  planName: string;
  coinAmount: number;
  price: number;
  transactionId: string;
  status: CoinRequestStatus;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  coins: number;
  price: number;
  description: string;
}

export interface DeliverySettings {
  enabled: boolean;
  baseCharge: number;
  peakCharge: number;
  peakHours: { start: string; end: string }[];
  baseTime: number;
  rooms: string[];
  staff: string[];
  priorityEnabled: boolean;
}
