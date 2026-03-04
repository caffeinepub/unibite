import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMenu } from "../../hooks/useStore";
import { menuStore } from "../../store/menuStore";
import type { AddOn, MenuItem } from "../../store/types";

const emptyItem = (): Omit<MenuItem, "id" | "createdAt"> => ({
  name: "",
  description: "",
  price: 0,
  imageUrl: "/assets/generated/food-placeholder.dim_400x300.png",
  addOns: [],
  coinRedeemable: false,
  enabled: true,
});

export default function ManageMenuPage() {
  const menu = useMenu();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<MenuItem, "id" | "createdAt">>(
    emptyItem(),
  );
  const [addOnInput, setAddOnInput] = useState({ name: "", price: "" });
  const [showAdd, setShowAdd] = useState(false);

  const startEdit = (item: MenuItem) => {
    setEditing(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      addOns: item.addOns,
      coinRedeemable: item.coinRedeemable,
      coinCost: item.coinCost,
      enabled: item.enabled,
    });
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyItem());
  };

  const saveEdit = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (editing) {
      menuStore.updateItem(editing, form);
    }
    setEditing(null);
    toast.success("Item updated");
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    menuStore.addItem(form);
    setForm(emptyItem());
    setShowAdd(false);
    toast.success("Item added");
  };

  const handleDelete = (id: string) => {
    menuStore.deleteItem(id);
    toast.success("Item deleted");
  };

  const toggleEnabled = (id: string, current: boolean) => {
    menuStore.updateItem(id, { enabled: !current });
  };

  const addAddOn = () => {
    if (!addOnInput.name.trim() || !addOnInput.price) return;
    const ao: AddOn = {
      name: addOnInput.name.trim(),
      price: Number(addOnInput.price),
    };
    setForm((f) => ({ ...f, addOns: [...f.addOns, ao] }));
    setAddOnInput({ name: "", price: "" });
  };

  const removeAddOn = (idx: number) => {
    setForm((f) => ({ ...f, addOns: f.addOns.filter((_, i) => i !== idx) }));
  };

  const FormPanel = ({
    onSave,
    onCancel,
  }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-3">
      <Input
        placeholder="Item name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
      />
      <Input
        type="number"
        placeholder="Price (₹)"
        value={form.price || ""}
        onChange={(e) =>
          setForm((f) => ({ ...f, price: Number(e.target.value) }))
        }
      />
      <Input
        placeholder="Image URL"
        value={form.imageUrl}
        onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
      />

      <div className="flex items-center gap-2">
        <Switch
          checked={form.coinRedeemable}
          onCheckedChange={(v) => setForm((f) => ({ ...f, coinRedeemable: v }))}
        />
        <span className="text-sm text-muted-foreground">Coin Redeemable</span>
      </div>

      {form.coinRedeemable && (
        <Input
          type="number"
          placeholder="Coin cost"
          value={form.coinCost || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, coinCost: Number(e.target.value) }))
          }
        />
      )}

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Add-ons</div>
        {form.addOns.map((ao, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: add-on list has no stable id
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="flex-1">
              {ao.name} — ₹{ao.price}
            </span>
            <button
              type="button"
              onClick={() => removeAddOn(i)}
              className="text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add-on name"
            value={addOnInput.name}
            onChange={(e) =>
              setAddOnInput((a) => ({ ...a, name: e.target.value }))
            }
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="₹"
            value={addOnInput.price}
            onChange={(e) =>
              setAddOnInput((a) => ({ ...a, price: e.target.value }))
            }
            className="w-20"
          />
          <Button size="sm" variant="outline" onClick={addAddOn}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="flex-1">
          <Check className="w-3 h-3 mr-1" /> Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          <X className="w-3 h-3 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Menu Items</h2>
        <Button
          size="sm"
          onClick={() => {
            setShowAdd(true);
            setEditing(null);
            setForm(emptyItem());
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {showAdd && (
        <FormPanel onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      <div className="space-y-3">
        {menu.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {editing === item.id ? (
              <div className="p-4">
                <FormPanel onSave={saveEdit} onCancel={cancelEdit} />
              </div>
            ) : (
              <div className="flex gap-3 p-3">
                <img
                  src={
                    item.imageUrl ||
                    "/assets/generated/food-placeholder.dim_400x300.png"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">
                      {item.name}
                    </span>
                    {item.coinRedeemable && (
                      <Badge variant="secondary" className="text-xs">
                        🪙 Coin
                      </Badge>
                    )}
                    {!item.enabled && (
                      <Badge variant="destructive" className="text-xs">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                  <div className="text-primary font-bold text-sm">
                    ₹{item.price}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={() => toggleEnabled(item.id, item.enabled)}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
