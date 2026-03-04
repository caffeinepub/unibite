import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApprovalPanel } from "../components/auth/ApprovalPanel";
import { authStore } from "../store/authStore";
import type { Session, UserRole } from "../store/types";

interface LoginPageProps {
  onLogin: (session: Session) => void;
}

const ADMIN_PASSWORD = "admin@unibite";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState("");

  // Admin panel state
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Check URL for hidden approval panel
  const urlParams = new URLSearchParams(window.location.search);
  const isApprovalMode = urlParams.get("approval") === "true";

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (newCount >= 5) {
      setShowAdminGate(true);
      setLogoClickCount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPendingMessage("");

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          toast.error("Please enter your name.");
          return;
        }
        const result = authStore.signup(
          email.trim(),
          password,
          name.trim(),
          role,
        );
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        if (role === "OWNER") {
          setPendingMessage(
            "Your account is pending approval. Please wait for the admin to approve your account.",
          );
          toast.info("Account created! Awaiting approval.");
          return;
        }
        const loginResult = authStore.login(email.trim(), password);
        if (loginResult.success && loginResult.session) {
          toast.success("Welcome to UniBite! 🍴");
          onLogin(loginResult.session);
        }
      } else {
        const result = authStore.login(email.trim(), password);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        if (result.session!.status === "OWNER_PENDING") {
          setPendingMessage(
            "Your account is pending approval. Please wait for the admin to approve your account.",
          );
          authStore.logout();
          return;
        }
        toast.success("Welcome back! 🍴");
        onLogin(result.session!);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setRecoveredPassword("");

    try {
      const user = authStore.getUserByEmail(forgotEmail.trim());
      if (!user) {
        toast.error("No account found with this email.");
        return;
      }
      setRecoveredPassword(user.password);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setShowAdminGate(false);
      setAdminPassword("");
    } else {
      toast.error("Incorrect admin password.");
      setAdminPassword("");
    }
  };

  const handleAdminPanelClose = () => {
    setAdminUnlocked(false);
    setShowAdminGate(false);
    setAdminPassword("");
  };

  // Show approval panel if URL param or unlocked via password gate
  if (isApprovalMode || adminUnlocked) {
    return <ApprovalPanel onBack={handleAdminPanelClose} />;
  }

  // Admin password gate
  if (showAdminGate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-heading font-bold text-primary">
              UniBite
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Order delicious food in seconds 🍴
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Admin</h2>
              <p className="text-xs text-muted-foreground">
                Enter the admin password to continue
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminUnlock} className="space-y-4">
            <div>
              <Label
                htmlFor="admin-password"
                className="text-sm font-semibold mb-1.5 block"
              >
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  autoFocus
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showAdminPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5"
            >
              Unlock Admin
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setShowAdminGate(false);
              setAdminPassword("");
            }}
            className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-heading font-bold text-primary">
              UniBite
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Order delicious food in seconds 🍴
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Forgot Password
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your email to retrieve your password
              </p>
            </div>
          </div>

          {recoveredPassword ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  ✅ Password Found!
                </p>
                <p className="text-xs text-green-700 mb-2">
                  Your password for{" "}
                  <span className="font-semibold">{forgotEmail}</span> is:
                </p>
                <div className="bg-white border border-green-300 rounded-lg px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-foreground tracking-wide">
                    {recoveredPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(recoveredPassword);
                      toast.success("Password copied!");
                    }}
                    className="text-xs text-primary hover:underline font-semibold shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                  setRecoveredPassword("");
                }}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label
                  htmlFor="forgot-email"
                  className="text-sm font-semibold mb-1.5 block"
                >
                  Email Address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={forgotLoading}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5"
              >
                {forgotLoading ? "Looking up..." : "Retrieve Password"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                  setRecoveredPassword("");
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: logo click for hidden admin panel */}
        <div
          className="flex items-center justify-center gap-2 mb-2 cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-heading font-bold text-primary">
            UniBite
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Order delicious food in seconds 🍴
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
        data-ocid="login.card"
      >
        {/* Tabs */}
        <div className="flex rounded-xl bg-secondary p-1 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("login");
              setPendingMessage("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("signup");
              setPendingMessage("");
            }}
          >
            Sign Up
          </button>
        </div>

        {pendingMessage && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{pendingMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold mb-1.5 block"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">
                  I am a
                </Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      role === "CUSTOMER"
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    🛒 Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("OWNER")}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      role === "OWNER"
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    🏪 Owner
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-semibold mb-1.5 block"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmail(email);
                    setRecoveredPassword("");
                  }}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-2.5"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Creating account..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </Button>
        </form>
      </div>

      {/* Visible Admin Access Button */}
      <div className="w-full max-w-md flex justify-center mt-4">
        <button
          type="button"
          data-ocid="login.admin_button"
          onClick={() => setShowAdminGate(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-full border border-border hover:border-primary bg-white shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </button>
      </div>
    </div>
  );
}
