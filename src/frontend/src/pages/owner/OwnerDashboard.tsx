import {
  BarChart2,
  ClipboardList,
  CreditCard,
  Layers,
  LayoutGrid,
  LogOut,
  Menu,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import type { Session } from "../../store/types";
import CombosPage from "./Combos";
import DeliveriesPage from "./Deliveries";
import ManageMenuPage from "./ManageMenu";
import OrdersPage from "./Orders";
import SalesPage from "./Sales";
import SubscriptionsPage from "./Subscriptions";

type OwnerTab =
  | "menu"
  | "combos"
  | "subscriptions"
  | "orders"
  | "deliveries"
  | "sales";

interface OwnerDashboardProps {
  session: Session;
  onLogout: () => void;
}

const tabs: { id: OwnerTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "menu",
    label: "Manage Menu",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  { id: "combos", label: "Combos", icon: <Layers className="w-4 h-4" /> },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "deliveries",
    label: "Deliveries",
    icon: <Truck className="w-4 h-4" />,
  },
  { id: "sales", label: "Sales", icon: <BarChart2 className="w-4 h-4" /> },
];

export default function OwnerDashboard({
  session,
  onLogout,
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<OwnerTab>("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: OwnerTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: sidebar backdrop
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-40 flex flex-col shadow-card transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-orange">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-primary">
                UniBite
              </span>
              <p className="text-[10px] text-muted-foreground leading-none">
                Owner Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-orange"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-foreground truncate">
              {session.name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {session.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-20 shadow-xs">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-primary">UniBite</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "menu" && <ManageMenuPage />}
          {activeTab === "combos" && <CombosPage />}
          {activeTab === "subscriptions" && <SubscriptionsPage />}
          {activeTab === "orders" && <OrdersPage />}
          {activeTab === "deliveries" && <DeliveriesPage />}
          {activeTab === "sales" && <SalesPage />}
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border bg-white text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} UniBite · Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "unibite-app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
