import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Coins, Copy, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { coinsStore } from "../../store/coinsStore";
import type { Session, SubscriptionPlan } from "../../store/types";

const UPI_ID = "6305506718@ptyes";

const PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    coins: 100,
    price: 99,
    description: "Perfect for occasional orders",
  },
  {
    id: "premium",
    name: "Premium",
    coins: 250,
    price: 199,
    description: "Best value for regular customers",
  },
  {
    id: "gold",
    name: "Gold",
    coins: 600,
    price: 449,
    description: "Maximum savings for power users",
  },
];

interface SubscriptionFlowProps {
  session: Session;
  onClose: () => void;
}

export default function SubscriptionFlow({
  session,
  onClose,
}: SubscriptionFlowProps) {
  const [step, setStep] = useState<"plans" | "payment">("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  const handleSubmit = () => {
    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID.");
      return;
    }
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      coinsStore.createCoinRequest({
        customerId: session.userId,
        planName: selectedPlan.name,
        coinAmount: selectedPlan.coins,
        price: selectedPlan.price,
        transactionId: transactionId.trim(),
      });
      toast.success(
        "Subscription payment submitted! Awaiting owner approval. 🪙",
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: modal backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {step === "payment" && (
                <button
                  type="button"
                  onClick={() => setStep("plans")}
                  className="text-muted-foreground hover:text-foreground mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="font-heading font-bold text-lg">
                {step === "plans" ? "🪙 Choose a Plan" : "💳 Complete Payment"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "plans" && (
            <div className="space-y-3">
              {PLANS.map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full text-left p-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-orange-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading font-bold text-base">
                          {plan.name}
                        </span>
                        {plan.id === "premium" && (
                          <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-600 font-bold justify-end">
                        <Coins className="w-4 h-4" />
                        <span className="text-lg">{plan.coins}</span>
                      </div>
                      <p className="text-primary font-bold text-sm">
                        ₹{plan.price}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "payment" && selectedPlan && (
            <div className="space-y-4">
              {/* Selected Plan Summary */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">
                      {selectedPlan.name} Plan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-600 font-bold flex items-center gap-1 justify-end">
                      <Coins className="w-3.5 h-3.5" />
                      {selectedPlan.coins} coins
                    </p>
                    <p className="text-primary font-bold">
                      ₹{selectedPlan.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* UPI Payment */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Pay to UPI ID:
                </p>
                <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-orange-200 mb-3">
                  <span className="font-mono font-bold text-sm">{UPI_ID}</span>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-center font-heading font-bold text-2xl text-primary mb-3">
                  ₹{selectedPlan.price}
                </p>
              </div>

              {/* Transaction ID */}
              <div>
                <Label
                  htmlFor="subTxnId"
                  className="text-xs font-semibold mb-1.5 block"
                >
                  Transaction ID / UTR Number
                </Label>
                <Input
                  id="subTxnId"
                  placeholder="Enter transaction ID after payment"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !transactionId.trim()}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-3 shadow-orange"
              >
                {submitting
                  ? "Submitting..."
                  : `✅ I Have Paid — ₹${selectedPlan.price}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
