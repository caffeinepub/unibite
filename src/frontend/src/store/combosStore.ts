import { generateOrderId } from "../utils/idGenerator";
import type { Combo } from "./types";

const STORAGE_KEY = "unibite_combos_v2";

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

function loadState(): Combo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Combo[];
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMBOS));
  return DEFAULT_COMBOS;
}

function saveState(combos: Combo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(combos));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export const combosStore = {
  getCombos(): Combo[] {
    return loadState();
  },

  addCombo(data: Omit<Combo, "id" | "createdAt">): Combo {
    const combos = loadState();
    const combo: Combo = {
      ...data,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
    };
    combos.push(combo);
    saveState(combos);
    return combo;
  },

  updateCombo(
    id: string,
    data: Partial<Omit<Combo, "id" | "createdAt">>,
  ): void {
    const combos = loadState();
    const idx = combos.findIndex((c) => c.id === id);
    if (idx >= 0) {
      combos[idx] = { ...combos[idx], ...data };
      saveState(combos);
    }
  },

  deleteCombo(id: string): void {
    const combos = loadState().filter((c) => c.id !== id);
    saveState(combos);
  },
};
