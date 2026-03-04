import { generateOrderId } from "../utils/idGenerator";
import {
  type CoinHistoryEntry,
  type CoinRequest,
  CoinRequestStatus,
  type CustomerCoins,
} from "./types";

const COINS_KEY = "unibite_coins";
const REQUESTS_KEY = "unibite_coin_requests";

function loadCoins(): Record<string, CustomerCoins> {
  try {
    const raw = localStorage.getItem(COINS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, CustomerCoins>;
  } catch {
    // ignore
  }
  return {};
}

function saveCoins(data: Record<string, CustomerCoins>): void {
  localStorage.setItem(COINS_KEY, JSON.stringify(data));
  window.dispatchEvent(new StorageEvent("storage", { key: COINS_KEY }));
}

function loadRequests(): CoinRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) return JSON.parse(raw) as CoinRequest[];
  } catch {
    // ignore
  }
  return [];
}

function saveRequests(requests: CoinRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new StorageEvent("storage", { key: REQUESTS_KEY }));
}

export const coinsStore = {
  getCustomerCoins(customerId: string): CustomerCoins {
    const all = loadCoins();
    if (!all[customerId]) {
      all[customerId] = { customerId, balance: 0, history: [] };
      saveCoins(all);
    }
    return all[customerId];
  },

  getBalance(customerId: string): number {
    return coinsStore.getCustomerCoins(customerId).balance;
  },

  addCoins(
    customerId: string,
    amount: number,
    description: string,
    expiryDays = 30,
  ): void {
    const all = loadCoins();
    if (!all[customerId]) {
      all[customerId] = { customerId, balance: 0, history: [] };
    }
    all[customerId].balance += amount;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    all[customerId].expiryDate = expiry.toISOString();
    const entry: CoinHistoryEntry = {
      id: generateOrderId(),
      type: "Credit",
      amount,
      description,
      date: new Date().toISOString(),
    };
    all[customerId].history.unshift(entry);
    saveCoins(all);
  },

  deductCoins(
    customerId: string,
    amount: number,
    description: string,
  ): boolean {
    const all = loadCoins();
    if (!all[customerId] || all[customerId].balance < amount) return false;
    all[customerId].balance -= amount;
    const entry: CoinHistoryEntry = {
      id: generateOrderId(),
      type: "Debit",
      amount,
      description,
      date: new Date().toISOString(),
    };
    all[customerId].history.unshift(entry);
    saveCoins(all);
    return true;
  },

  createCoinRequest(data: {
    customerId: string;
    planName: string;
    coinAmount: number;
    price: number;
    transactionId: string;
  }): CoinRequest {
    const requests = loadRequests();
    const req: CoinRequest = {
      id: generateOrderId(),
      ...data,
      status: "PENDING_COIN_APPROVAL",
      createdAt: new Date().toISOString(),
    };
    requests.push(req);
    saveRequests(requests);
    return req;
  },

  getPendingRequests(): CoinRequest[] {
    return loadRequests().filter((r) => r.status === "PENDING_COIN_APPROVAL");
  },

  getAllRequests(): CoinRequest[] {
    return loadRequests();
  },

  approveRequest(requestId: string): void {
    const requests = loadRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      const req = requests[idx];
      requests[idx].status = "APPROVED";
      saveRequests(requests);
      coinsStore.addCoins(
        req.customerId,
        req.coinAmount,
        `Subscription: ${req.planName}`,
      );
    }
  },

  rejectRequest(requestId: string): void {
    const requests = loadRequests();
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      requests[idx].status = "REJECTED";
      saveRequests(requests);
    }
  },

  getPendingCoinsForCustomer(customerId: string): number {
    return loadRequests()
      .filter(
        (r) =>
          r.customerId === customerId && r.status === "PENDING_COIN_APPROVAL",
      )
      .reduce((sum, r) => sum + r.coinAmount, 0);
  },
};
