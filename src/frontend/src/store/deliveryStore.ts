import type { DeliverySettings } from "./types";

const DELIVERY_KEY = "unibite_delivery_settings";

const DEFAULT_SETTINGS: DeliverySettings = {
  enabled: true,
  baseCharge: 20,
  peakCharge: 30,
  peakHours: [
    { start: "12:00", end: "14:00" },
    { start: "18:00", end: "20:00" },
  ],
  baseTime: 18,
  rooms: ["E202", "C303", "D404"],
  staff: ["Ravi", "Arjun", "Meena"],
  priorityEnabled: true,
};

export function getDeliverySettings(): DeliverySettings {
  try {
    const raw = localStorage.getItem(DELIVERY_KEY);
    if (!raw) {
      localStorage.setItem(DELIVERY_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function save(settings: DeliverySettings) {
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(settings));
  window.dispatchEvent(new StorageEvent("storage", { key: DELIVERY_KEY }));
}

export function updateDeliverySettings(partial: Partial<DeliverySettings>) {
  const current = getDeliverySettings();
  save({ ...current, ...partial });
}

export function addRoom(room: string) {
  const s = getDeliverySettings();
  if (!s.rooms.includes(room)) {
    save({ ...s, rooms: [...s.rooms, room] });
  }
}

export function deleteRoom(room: string) {
  const s = getDeliverySettings();
  save({ ...s, rooms: s.rooms.filter((r) => r !== room) });
}

export function addStaff(name: string) {
  const s = getDeliverySettings();
  if (!s.staff.includes(name)) {
    save({ ...s, staff: [...s.staff, name] });
  }
}

export function deleteStaff(name: string) {
  const s = getDeliverySettings();
  save({ ...s, staff: s.staff.filter((st) => st !== name) });
}
