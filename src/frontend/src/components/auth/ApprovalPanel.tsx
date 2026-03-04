import { ArrowLeft, CheckCircle, Clock, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { useCoinRequests } from "../../hooks/useStore";
import { authStore } from "../../store/authStore";
import { coinsStore } from "../../store/coinsStore";
import type { CoinRequest } from "../../store/types";

interface ApprovalPanelProps {
  onBack: () => void;
}

type AdminTab = "owners" | "coins";

export function ApprovalPanel({ onBack }: ApprovalPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("owners");
  const { requests: coinRequests } = useCoinRequests();
  const [, forceUpdate] = useState(0);

  const pendingOwners = authStore.getPendingOwners();
  const pendingCoinRequests = coinRequests.filter(
    (r: CoinRequest) => r.status === "PENDING_COIN_APPROVAL",
  );
  const processedCoinRequests = coinsStore
    .getAllRequests()
    .filter((r: CoinRequest) => r.status !== "PENDING_COIN_APPROVAL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApproveOwner = (userId: string) => {
    setProcessingId(userId);
    authStore.approveOwner(userId);
    setTimeout(() => {
      setProcessingId(null);
      forceUpdate((n) => n + 1);
    }, 500);
  };

  const handleApproveCoin = (request: CoinRequest) => {
    setProcessingId(request.id);
    coinsStore.approveRequest(request.id);
    setTimeout(() => setProcessingId(null), 500);
  };

  const handleRejectCoin = (request: CoinRequest) => {
    setProcessingId(request.id);
    coinsStore.rejectRequest(request.id);
    setTimeout(() => setProcessingId(null), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center gap-4 shadow-md sticky top-0 z-40">
        <button
          type="button"
          onClick={onBack}
          className="p-1 hover:bg-primary-foreground/20 rounded-lg transition-colors"
          data-ocid="admin.close_button"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-xs opacity-70">
            Manage owner approvals and coin requests
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex rounded-xl bg-secondary p-1 mb-4">
          <button
            type="button"
            data-ocid="admin.owners.tab"
            onClick={() => setActiveTab("owners")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "owners"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={14} />
            Owner Approvals
            {pendingOwners.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {pendingOwners.length}
              </span>
            )}
          </button>
          <button
            type="button"
            data-ocid="admin.coins.tab"
            onClick={() => setActiveTab("coins")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "coins"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🪙 Coin Requests
            {pendingCoinRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {pendingCoinRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Owner Approvals Tab */}
        {activeTab === "owners" && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Pending Owner Accounts ({pendingOwners.length})
            </h2>

            {pendingOwners.length === 0 ? (
              <div
                className="bg-card rounded-xl p-6 text-center text-muted-foreground border border-border"
                data-ocid="admin.owners.empty_state"
              >
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">
                  No pending owner approvals
                </p>
                <p className="text-xs mt-1">
                  New owner signups will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="admin.owners.list">
                {pendingOwners.map((owner, idx) => (
                  <div
                    key={owner.id}
                    data-ocid={`admin.owners.item.${idx + 1}`}
                    className="bg-card rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {owner.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {owner.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered:{" "}
                          {new Date(owner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                        Pending
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-ocid={`admin.owners.confirm_button.${idx + 1}`}
                        onClick={() => handleApproveOwner(owner.id)}
                        disabled={processingId === owner.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        Approve Owner
                      </button>
                      <button
                        type="button"
                        data-ocid={`admin.owners.delete_button.${idx + 1}`}
                        disabled={processingId === owner.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        onClick={() => {
                          setProcessingId(owner.id);
                          authStore.rejectOwner(owner.id);
                          setTimeout(() => {
                            setProcessingId(null);
                            forceUpdate((n) => n + 1);
                          }, 500);
                        }}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Coin Requests Tab */}
        {activeTab === "coins" && (
          <>
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                Pending Coin Requests ({pendingCoinRequests.length})
              </h2>

              {pendingCoinRequests.length === 0 ? (
                <div
                  className="bg-card rounded-xl p-6 text-center text-muted-foreground border border-border"
                  data-ocid="admin.coins.empty_state"
                >
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No pending coin requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCoinRequests.map((request: CoinRequest, idx) => (
                    <div
                      key={request.id}
                      data-ocid={`admin.coins.item.${idx + 1}`}
                      className="bg-card rounded-xl p-4 border border-border shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {request.customerId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {request.planName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₹{request.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>🪙 {request.coinAmount} coins</span>
                        <span>Txn: {request.transactionId}</span>
                        <span>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          data-ocid={`admin.coins.confirm_button.${idx + 1}`}
                          onClick={() => handleApproveCoin(request)}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          type="button"
                          data-ocid={`admin.coins.delete_button.${idx + 1}`}
                          onClick={() => handleRejectCoin(request)}
                          disabled={processingId === request.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {processedCoinRequests.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Recent Activity
                </h2>
                <div className="space-y-2">
                  {processedCoinRequests
                    .slice(0, 10)
                    .map((request: CoinRequest) => (
                      <div
                        key={request.id}
                        className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {request.customerId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.planName} · {request.coinAmount} coins
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            request.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {request.status === "APPROVED"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
