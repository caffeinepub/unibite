import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock, MapPin, Plus, Trash2, Truck, Users, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeliverySettings } from "../../hooks/useStore";
import {
  addRoom,
  addStaff,
  deleteRoom,
  deleteStaff,
  updateDeliverySettings,
} from "../../store/deliveryStore";

export default function DeliveriesPage() {
  const settings = useDeliverySettings();
  const [newRoom, setNewRoom] = useState("");
  const [newStaff, setNewStaff] = useState("");
  const [newPeakStart, setNewPeakStart] = useState("");
  const [newPeakEnd, setNewPeakEnd] = useState("");

  const handleAddRoom = () => {
    const trimmed = newRoom.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter a room number");
      return;
    }
    if (settings.rooms.includes(trimmed)) {
      toast.error("Room already exists");
      return;
    }
    addRoom(trimmed);
    setNewRoom("");
    toast.success(`Room ${trimmed} added`);
  };

  const handleDeleteRoom = (room: string) => {
    deleteRoom(room);
    toast.success(`Room ${room} removed`);
  };

  const handleAddStaff = () => {
    const trimmed = newStaff.trim();
    if (!trimmed) {
      toast.error("Enter staff name");
      return;
    }
    if (settings.staff.includes(trimmed)) {
      toast.error("Staff already exists");
      return;
    }
    addStaff(trimmed);
    setNewStaff("");
    toast.success(`${trimmed} added to staff`);
  };

  const handleDeleteStaff = (name: string) => {
    deleteStaff(name);
    toast.success(`${name} removed from staff`);
  };

  const handleAddPeakHour = () => {
    if (!newPeakStart || !newPeakEnd) {
      toast.error("Enter both start and end times");
      return;
    }
    const updated = [
      ...settings.peakHours,
      { start: newPeakStart, end: newPeakEnd },
    ];
    updateDeliverySettings({ peakHours: updated });
    setNewPeakStart("");
    setNewPeakEnd("");
    toast.success("Peak hour range added");
  };

  const handleDeletePeakHour = (idx: number) => {
    const updated = settings.peakHours.filter((_, i) => i !== idx);
    updateDeliverySettings({ peakHours: updated });
    toast.success("Peak hour range removed");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-5 h-5 text-primary" />
        <h2 className="font-heading font-bold text-2xl">
          Delivery Control Panel
        </h2>
      </div>

      {/* Enable/Disable Delivery */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-foreground">Delivery Service</div>
          <div className="text-xs text-muted-foreground">
            Enable or disable room delivery for customers
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={
              settings.enabled
                ? "bg-green-500 text-white border-0"
                : "bg-red-500 text-white border-0"
            }
          >
            {settings.enabled ? "Active" : "Disabled"}
          </Badge>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(val) => {
              updateDeliverySettings({ enabled: val });
              toast.success(`Delivery ${val ? "enabled" : "disabled"}`);
            }}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> Pricing Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: plain label for visual grouping */}
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Base Delivery Charge (₹)
            </label>
            <Input
              id="base-charge"
              type="number"
              min={0}
              value={settings.baseCharge}
              onChange={(e) =>
                updateDeliverySettings({ baseCharge: Number(e.target.value) })
              }
            />
          </div>
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: plain label for visual grouping */}
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Peak Hour Charge (₹)
            </label>
            <Input
              id="peak-charge"
              type="number"
              min={0}
              value={settings.peakCharge}
              onChange={(e) =>
                updateDeliverySettings({ peakCharge: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      {/* Delivery Time */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Delivery Time
        </h3>
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: plain label for visual grouping */}
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Base Delivery Time (minutes)
          </label>
          <Input
            id="base-time"
            type="number"
            min={1}
            value={settings.baseTime}
            onChange={(e) =>
              updateDeliverySettings({ baseTime: Number(e.target.value) })
            }
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          🔴 Peak Hours Configuration
        </h3>
        <div className="space-y-2">
          {settings.peakHours.map((ph, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: peak hours have no stable id
              key={idx}
              className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground flex-1">
                {ph.start} – {ph.end}
              </span>
              <button
                type="button"
                onClick={() => handleDeletePeakHour(idx)}
                className="text-destructive hover:opacity-70 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={newPeakStart}
            onChange={(e) => setNewPeakStart(e.target.value)}
            className="flex-1"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="time"
            value={newPeakEnd}
            onChange={(e) => setNewPeakEnd(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddPeakHour}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Priority System */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-foreground flex items-center gap-2">
            ⭐ Priority Customer System
          </div>
          <div className="text-xs text-muted-foreground">
            Customers with 5+ orders get priority treatment and reduced delivery
            time
          </div>
        </div>
        <Switch
          checked={settings.priorityEnabled}
          onCheckedChange={(val) => {
            updateDeliverySettings({ priorityEnabled: val });
            toast.success(`Priority system ${val ? "enabled" : "disabled"}`);
          }}
        />
      </div>

      {/* Room Management */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Room Management
        </h3>
        <div className="flex flex-wrap gap-2">
          {settings.rooms.map((room) => (
            <div
              key={room}
              className="flex items-center gap-1 bg-secondary rounded-xl px-3 py-1.5"
            >
              <span className="text-sm font-medium text-foreground">
                {room}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteRoom(room)}
                className="text-destructive hover:opacity-70 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Room number (e.g. A101)"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
          />
          <Button onClick={handleAddRoom}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Staff Management */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Delivery Staff
        </h3>
        <div className="flex flex-wrap gap-2">
          {settings.staff.map((name) => (
            <div
              key={name}
              className="flex items-center gap-1 bg-secondary rounded-xl px-3 py-1.5"
            >
              <span className="text-sm font-medium text-foreground">
                🚚 {name}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteStaff(name)}
                className="text-destructive hover:opacity-70 ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Staff name (e.g. Ravi)"
            value={newStaff}
            onChange={(e) => setNewStaff(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStaff()}
          />
          <Button onClick={handleAddStaff}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
