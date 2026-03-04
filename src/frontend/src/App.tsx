import { useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./pages/Login";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import { authStore } from "./store/authStore";
import type { Session } from "./store/types";

export default function App() {
  const [session, setSession] = useState<Session | null>(() =>
    authStore.getSession(),
  );

  useEffect(() => {
    const handler = () => setSession(authStore.getSession());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogin = (s: Session) => {
    setSession(s);
  };

  const handleLogout = () => {
    authStore.logout();
    setSession(null);
  };

  if (!session) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      {session.role === "OWNER" ? (
        <OwnerDashboard session={session} onLogout={handleLogout} />
      ) : (
        <CustomerDashboard session={session} onLogout={handleLogout} />
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}
