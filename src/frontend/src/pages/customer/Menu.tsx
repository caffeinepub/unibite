import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCombos, useMenuItems } from "../../hooks/useStore";
import { cartStore } from "../../store/cartStore";
import type { AddOn } from "../../store/types";

interface MenuPageProps {
  session: { userId: string };
  onCartCountChange: (count: number) => void;
}

export default function MenuPage({ onCartCountChange }: MenuPageProps) {
  const { items } = useMenuItems();
  const { combos } = useCombos();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, AddOn[]>>(
    {},
  );

  const enabledItems = items.filter((m) => m.enabled);

  const getQty = (id: string) => quantities[id] ?? 1;
  const getAddOns = (id: string) => selectedAddOns[id] ?? [];

  const toggleAddOn = (itemId: string, addOn: AddOn) => {
    setSelectedAddOns((prev) => {
      const current = prev[itemId] ?? [];
      const exists = current.find((a) => a.name === addOn.name);
      return {
        ...prev,
        [itemId]: exists
          ? current.filter((a) => a.name !== addOn.name)
          : [...current, addOn],
      };
    });
  };

  const refreshCartCount = () => {
    const count = cartStore.getItems().reduce((s, i) => s + i.quantity, 0);
    onCartCountChange(count);
  };

  const handleAddToCart = (item: (typeof enabledItems)[0]) => {
    const addOns = getAddOns(item.id);
    const addOnTotal = addOns.reduce((s, a) => s + a.price, 0);
    cartStore.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price + addOnTotal,
      quantity: getQty(item.id),
      selectedAddOns: addOns,
      imageUrl: item.imageUrl,
    });
    refreshCartCount();
    toast.success(`${item.name} added to cart!`);
  };

  const handleAddCombo = (combo: (typeof combos)[0]) => {
    cartStore.addItem({
      menuItemId: combo.id,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      selectedAddOns: [],
      imageUrl: combo.imageUrl,
    });
    refreshCartCount();
    toast.success(`${combo.name} combo added to cart!`);
  };

  return (
    <div className="px-4 py-4 space-y-6 animate-fade-in">
      {combos.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            🔥 Popular Combos
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {combos.map((combo) => (
              <div
                key={combo.id}
                className="min-w-[200px] bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-shrink-0"
              >
                <img
                  src={
                    combo.imageUrl ||
                    "/assets/generated/food-placeholder.dim_400x300.png"
                  }
                  alt={combo.name}
                  className="w-full h-28 object-cover"
                />
                <div className="p-3">
                  <div className="font-semibold text-sm text-foreground">
                    {combo.name}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold">
                      ₹{combo.price}
                    </span>
                    <Button size="sm" onClick={() => handleAddCombo(combo)}>
                      <ShoppingCart className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">🍽️ Menu</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {enabledItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
            >
              <img
                src={
                  item.imageUrl ||
                  "/assets/generated/food-placeholder.dim_400x300.png"
                }
                alt={item.name}
                className="w-full h-36 object-cover"
              />
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">
                      {item.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-primary font-bold text-sm">
                    ₹{item.price}
                  </div>
                </div>

                {item.coinRedeemable && item.coinCost && (
                  <Badge variant="secondary" className="text-xs">
                    <Coins className="w-3 h-3 mr-1" />
                    {item.coinCost} coins
                  </Badge>
                )}

                {item.addOns.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Add-ons:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.addOns.map((addOn) => {
                        const selected = getAddOns(item.id).find(
                          (a) => a.name === addOn.name,
                        );
                        return (
                          <button
                            type="button"
                            key={addOn.name}
                            onClick={() => toggleAddOn(item.id, addOn)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary"
                            }`}
                          >
                            +{addOn.name} ₹{addOn.price}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantities((p) => ({
                          ...p,
                          [item.id]: Math.max(1, getQty(item.id) - 1),
                        }))
                      }
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {getQty(item.id)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantities((p) => ({
                          ...p,
                          [item.id]: getQty(item.id) + 1,
                        }))
                      }
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <Button size="sm" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
