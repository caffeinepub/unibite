import { useCallback, useEffect, useState } from "react";
import { authStore } from "../store/authStore";
import { cartStore } from "../store/cartStore";
import { coinsStore } from "../store/coinsStore";
import { getDeliverySettings } from "../store/deliveryStore";
import { combosStore, menuStore } from "../store/menuStore";
import { ordersStore } from "../store/ordersStore";
import type {
  CartItem,
  CoinRequest,
  Combo,
  CustomerCoins,
  DeliverySettings,
  MenuItem,
  Order,
  Session,
} from "../store/types";

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(() =>
    authStore.getSession(),
  );

  useEffect(() => {
    const handler = () => setSession(authStore.getSession());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return session;
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>(() => menuStore.getItems());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_menu_v2") setItems(menuStore.getItems());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = () => setItems(menuStore.getItems());
  return { items, refresh };
}

// Alias for owner pages that use useMenu
export function useMenu(): MenuItem[] {
  const [items, setItems] = useState<MenuItem[]>(() => menuStore.getItems());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_menu_v2") setItems(menuStore.getItems());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return items;
}

export function useCombos() {
  const [combos, setCombos] = useState<Combo[]>(() => combosStore.getCombos());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_combos_v2")
        setCombos(combosStore.getCombos());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = () => setCombos(combosStore.getCombos());
  return { combos, refresh };
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => cartStore.getItems());

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_cart") setItems(cartStore.getItems());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = () => setItems(cartStore.getItems());
  return { items, refresh };
}

export function useOrders(customerId?: string) {
  const [orders, setOrders] = useState<Order[]>(() =>
    customerId
      ? ordersStore.getOrdersByCustomer(customerId)
      : ordersStore.getOrders(),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_orders") {
        setOrders(
          customerId
            ? ordersStore.getOrdersByCustomer(customerId)
            : ordersStore.getOrders(),
        );
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [customerId]);

  const refresh = useCallback(
    () =>
      setOrders(
        customerId
          ? ordersStore.getOrdersByCustomer(customerId)
          : ordersStore.getOrders(),
      ),
    [customerId],
  );
  return { orders, refresh };
}

export function useCustomerCoins(customerId: string) {
  const [coins, setCoins] = useState<CustomerCoins>(() =>
    coinsStore.getCustomerCoins(customerId),
  );
  const [pendingCoins, setPendingCoins] = useState<number>(() =>
    coinsStore.getPendingCoinsForCustomer(customerId),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === "unibite_coins" ||
        e.key === "unibite_coin_requests"
      ) {
        setCoins(coinsStore.getCustomerCoins(customerId));
        setPendingCoins(coinsStore.getPendingCoinsForCustomer(customerId));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [customerId]);

  return { coins, pendingCoins };
}

export function useCoinRequests() {
  const [requests, setRequests] = useState<CoinRequest[]>(() =>
    coinsStore.getPendingRequests(),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_coin_requests")
        setRequests(coinsStore.getPendingRequests());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = () => setRequests(coinsStore.getPendingRequests());
  return { requests, refresh };
}

export function useDeliverySettings(): DeliverySettings {
  const [settings, setSettings] = useState<DeliverySettings>(() =>
    getDeliverySettings(),
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key === "unibite_delivery_settings") {
        setSettings(getDeliverySettings());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return settings;
}

export function isPeakHour(): boolean {
  const settings = getDeliverySettings();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return settings.peakHours.some(({ start, end }) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return currentMinutes >= startMin && currentMinutes <= endMin;
  });
}
