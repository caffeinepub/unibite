import { Button } from "@/components/ui/button";
import { CheckCircle, Coins, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCoinRequests } from "../../hooks/useStore";
import { authStore } from "../../store/authStore";
import { coinsStore } from "../../store/coinsStore";
import type { CoinRequest } from "../../store/types";

export default function SubscriptionsPage() {
  const { requests, refresh } = useCoinRequests();

  const handleApprove = (req: CoinRequest) => {
    coinsStore.approveRequest(req.id);
    refresh();
    const user = authStore.getUserById(req.customerId);
    toast.success(
      `Approved ${req.coinAmount} coins for ${user?.name || "customer"}.`,
    );
  };

  const handleReject = (req: CoinRequest) => {
    coinsStore.rejectRequest(req.id);
    refresh();
    toast.success("Request rejected.");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl">Coin Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {requests.length} pending request{requests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border">
          <div className="text-5xl mb-3">🪙</div>
          <p className="font-semibold text-muted-foreground">
            No pending coin requests
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Customer coin purchase requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const user = authStore.getUserById(req.customerId);
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-border shadow-card p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">
                        {user?.name || "Unknown"}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Coins className="w-2.5 h-2.5" />
                        {req.planName} Plan
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      #{req.id}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-amber-600 flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" />
                      {req.coinAmount} coins
                    </p>
                    <p className="text-primary font-bold text-sm">
                      ₹{req.price}
                    </p>
                  </div>
                </div>

                <div className="mb-3 p-2.5 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-[10px] text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {req.transactionId}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5 text-xs flex-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReject(req)}
                    variant="destructive"
                    className="rounded-xl gap-1.5 text-xs flex-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
