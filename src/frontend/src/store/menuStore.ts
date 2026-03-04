import { generateOrderId } from "../utils/idGenerator";
import type { Combo, MenuItem } from "./types";

const MENU_KEY = "unibite_menu_v2";
const COMBOS_KEY = "unibite_combos_v2";

const DEFAULT_MENU: MenuItem[] = [
  {
    id: "item-1",
    name: "Veg Burger",
    description: "Crispy veggie patty with fresh lettuce",
    price: 60,
    imageUrl: "/assets/generated/menu-veg-burger.dim_400x300.jpg",
    addOns: [
      { name: "Extra Cheese", price: 15 },
      { name: "Jalapeños", price: 10 },
    ],
    coinRedeemable: true,
    coinCost: 80,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    name: "Masala Fries",
    description: "Crispy fries with spicy masala seasoning",
    price: 40,
    imageUrl: "/assets/generated/menu-masala-fries.dim_400x300.jpg",
    addOns: [{ name: "Extra Sauce", price: 5 }],
    coinRedeemable: false,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-3",
    name: "Cold Coffee",
    description: "Chilled coffee with milk and ice cream",
    price: 50,
    imageUrl: "/assets/generated/menu-cold-coffee.dim_400x300.jpg",
    addOns: [{ name: "Extra Shot", price: 20 }],
    coinRedeemable: true,
    coinCost: 60,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-4",
    name: "Paneer Wrap",
    description: "Grilled paneer with mint chutney in a wrap",
    price: 80,
    imageUrl: "/assets/generated/menu-paneer-wrap.dim_400x300.jpg",
    addOns: [
      { name: "Extra Paneer", price: 25 },
      { name: "Cheese Slice", price: 15 },
    ],
    coinRedeemable: true,
    coinCost: 100,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_COMBOS: Combo[] = [
  {
    id: "combo-1",
    name: "Desi Feast",
    imageUrl: "/assets/generated/menu-combo-desi-feast.dim_400x300.jpg",
    itemIds: ["item-1", "item-2"],
    price: 90,
    createdAt: new Date().toISOString(),
  },
  {
    id: "combo-2",
    name: "Veg Delight",
    imageUrl: "/assets/generated/menu-combo-veg-delight.dim_400x300.jpg",
    itemIds: ["item-3", "item-4"],
    price: 120,
    createdAt: new Date().toISOString(),
  },
];

export const menuStore = {
  getItems(): MenuItem[] {
    try {
      const raw = localStorage.getItem(MENU_KEY);
      if (!raw) {
        localStorage.setItem(MENU_KEY, JSON.stringify(DEFAULT_MENU));
        return DEFAULT_MENU;
      }
      return JSON.parse(raw) as MenuItem[];
    } catch {
      return DEFAULT_MENU;
    }
  },

  saveItems(items: MenuItem[]): void {
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
    window.dispatchEvent(new StorageEvent("storage", { key: MENU_KEY }));
  },

  addItem(data: Omit<MenuItem, "id" | "createdAt">): MenuItem {
    const items = menuStore.getItems();
    const item: MenuItem = {
      ...data,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
    };
    items.push(item);
    menuStore.saveItems(items);
    return item;
  },

  updateItem(
    id: string,
    data: Partial<Omit<MenuItem, "id" | "createdAt">>,
  ): void {
    const items = menuStore.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...data };
      menuStore.saveItems(items);
    }
  },

  deleteItem(id: string): void {
    menuStore.saveItems(menuStore.getItems().filter((i) => i.id !== id));
  },
};

export const combosStore = {
  getCombos(): Combo[] {
    try {
      const raw = localStorage.getItem(COMBOS_KEY);
      if (!raw) {
        localStorage.setItem(COMBOS_KEY, JSON.stringify(DEFAULT_COMBOS));
        return DEFAULT_COMBOS;
      }
      return JSON.parse(raw) as Combo[];
    } catch {
      return DEFAULT_COMBOS;
    }
  },

  saveCombos(combos: Combo[]): void {
    localStorage.setItem(COMBOS_KEY, JSON.stringify(combos));
    window.dispatchEvent(new StorageEvent("storage", { key: COMBOS_KEY }));
  },

  addCombo(data: Omit<Combo, "id" | "createdAt">): Combo {
    const combos = combosStore.getCombos();
    const combo: Combo = {
      ...data,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
    };
    combos.push(combo);
    combosStore.saveCombos(combos);
    return combo;
  },

  updateCombo(
    id: string,
    data: Partial<Omit<Combo, "id" | "createdAt">>,
  ): void {
    const combos = combosStore.getCombos();
    const idx = combos.findIndex((c) => c.id === id);
    if (idx >= 0) {
      combos[idx] = { ...combos[idx], ...data };
      combosStore.saveCombos(combos);
    }
  },

  deleteCombo(id: string): void {
    combosStore.saveCombos(combosStore.getCombos().filter((c) => c.id !== id));
  },
};
