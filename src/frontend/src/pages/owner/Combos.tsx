import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCombos, useMenu } from "../../hooks/useStore";
import { combosStore } from "../../store/menuStore";
import type { Combo } from "../../store/types";

const emptyCombo = (): Omit<Combo, "id" | "createdAt"> => ({
  name: "",
  imageUrl: "/assets/generated/food-placeholder.dim_400x300.png",
  itemIds: [],
  price: 0,
});

export default function CombosPage() {
  const { combos } = useCombos();
  const menu = useMenu();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Combo, "id" | "createdAt">>(
    emptyCombo(),
  );
  const [showAdd, setShowAdd] = useState(false);

  const startEdit = (combo: Combo) => {
    setEditing(combo.id);
    setForm({
      name: combo.name,
      imageUrl: combo.imageUrl,
      itemIds: combo.itemIds,
      price: combo.price,
    });
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyCombo());
  };

  const saveEdit = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    if (editing) {
      combosStore.updateCombo(editing, form);
    }
    setEditing(null);
    toast.success("Combo updated");
  };

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    combosStore.addCombo(form);
    setForm(emptyCombo());
    setShowAdd(false);
    toast.success("Combo added");
  };

  const handleDelete = (id: string) => {
    combosStore.deleteCombo(id);
    toast.success("Combo deleted");
  };

  const toggleItem = (itemId: string) => {
    setForm((f) => ({
      ...f,
      itemIds: f.itemIds.includes(itemId)
        ? f.itemIds.filter((i) => i !== itemId)
        : [...f.itemIds, itemId],
    }));
  };

  const FormPanel = ({
    onSave,
    onCancel,
  }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-muted/50 rounded-xl border border-border p-4 space-y-3">
      <Input
        placeholder="Combo name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          Select Menu Items
        </div>
        <div className="flex flex-wrap gap-2">
          {menu
            .filter((m) => m.enabled)
            .map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => toggleItem(m.id)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  form.itemIds.includes(m.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {m.name}
              </button>
            ))}
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
        <h2 className="text-xl font-bold text-foreground">Combo Deals</h2>
        <Button
          size="sm"
          onClick={() => {
            setShowAdd(true);
            setEditing(null);
            setForm(emptyCombo());
          }}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Combo
        </Button>
      </div>

      {showAdd && (
        <FormPanel onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      <div className="space-y-3">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {editing === combo.id ? (
              <div className="p-4">
                <FormPanel onSave={saveEdit} onCancel={cancelEdit} />
              </div>
            ) : (
              <div className="flex gap-3 p-3">
                <img
                  src={
                    combo.imageUrl ||
                    "/assets/generated/food-placeholder.dim_400x300.png"
                  }
                  alt={combo.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm">
                    {combo.name}
                  </div>
                  <div className="text-primary font-bold text-sm">
                    ₹{combo.price}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {combo.itemIds.map((id) => {
                      const item = menu.find((m) => m.id === id);
                      return item ? (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {item.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(combo)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(combo.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
