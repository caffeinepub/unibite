import { generateOrderId } from "../utils/idGenerator";
import { AddOn, type CartItem } from "./types";

const STORAGE_KEY = "unibite_cart";

function loadState(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    // ignore
  }
  return [];
}

function saveState(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export const cartStore = {
  getItems(): CartItem[] {
    return loadState();
  },

  addItem(item: Omit<CartItem, "id">): void {
    const items = loadState();
    // Check if same item with same add-ons exists
    const existing = items.find(
      (i) =>
        i.menuItemId === item.menuItemId &&
        JSON.stringify(i.selectedAddOns) ===
          JSON.stringify(item.selectedAddOns),
    );
    if (existing) {
      existing.quantity += item.quantity;
      saveState(items);
    } else {
      items.push({ ...item, id: generateOrderId() });
      saveState(items);
    }
  },

  updateQuantity(id: string, quantity: number): void {
    const items = loadState();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      if (quantity <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx].quantity = quantity;
      }
      saveState(items);
    }
  },

  removeItem(id: string): void {
    const items = loadState().filter((i) => i.id !== id);
    saveState(items);
  },

  clearCart(): void {
    saveState([]);
  },

  getTotal(): number {
    return loadState().reduce((sum, item) => {
      const addOnTotal = item.selectedAddOns.reduce((s, a) => s + a.price, 0);
      return sum + (item.price + addOnTotal) * item.quantity;
    }, 0);
  },
};
