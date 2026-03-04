import {
  ClipboardList,
  Gift,
  ShoppingCart,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useCustomerCoins } from "../../hooks/useStore";
import type { Session } from "../../store/types";
import CartPage from "./Cart";
import MenuPage from "./Menu";
import MyOrdersPage from "./MyOrders";
import RedeemStorePage from "./RedeemStore";
import WalletPage from "./Wallet";

interface CustomerDashboardProps {
  session: Session;
  onLogout: () => void;
}

type Tab = "menu" | "cart" | "orders" | "redeem" | "wallet";

export default function CustomerDashboard({
  session,
  onLogout,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [cartCount, setCartCount] = useState(0);
  const { coins } = useCustomerCoins(session.userId);

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { id: "orders", label: "My Orders", icon: ClipboardList },
    { id: "redeem", label: "Treat Shop", icon: Gift },
    { id: "wallet", label: "Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl">UniBite</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
              <Wallet className="w-4 h-4" />
              <span>{coins.balance} coins</span>
            </div>
            <span className="text-sm opacity-80 hidden sm:inline">
              {session.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      {activeTab === "menu" && (
        <div className="relative overflow-hidden">
          <img
            src="/assets/generated/menu-hero-banner.dim_1200x400.png"
            alt="UniBite Banner"
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent flex items-center px-6">
            <div>
              <h2 className="text-white text-xl font-bold">
                Campus Bites, Delivered Fast 🚀
              </h2>
              <p className="text-white/80 text-sm">
                Order now, pick up or get it delivered!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full pb-20">
        {activeTab === "menu" && (
          <MenuPage session={session} onCartCountChange={setCartCount} />
        )}
        {activeTab === "cart" && (
          <CartPage
            session={session}
            onOrderPlaced={() => setActiveTab("orders")}
          />
        )}
        {activeTab === "orders" && <MyOrdersPage session={session} />}
        {activeTab === "redeem" && <RedeemStorePage session={session} />}
        {activeTab === "wallet" && <WalletPage session={session} />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors relative ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <span>{label}</span>
              {activeTab === id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
