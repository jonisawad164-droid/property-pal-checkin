import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Home } from "lucide-react";
import { toast } from "sonner";

type Room = {
  name: string;
  projected_flow: string;
  measured_flow: string;
  method: string;
};

type Apartment = {
  id?: string;
  apartment_number: string;
  tenant_name: string;
  floor: string;
  rooms: Room[];
  _new?: boolean;
  _dirty?: boolean;
};

const DEFAULT_ROOMS: Room[] = [
  { name: "Kök", projected_flow: "", measured_flow: "", method: "K" },
  { name: "Bad", projected_flow: "", measured_flow: "", method: "K" },
  { name: "WC", projected_flow: "", measured_flow: "", method: "K" },
  { name: "Klk", projected_flow: "", measured_flow: "", method: "K" },
];

const METHOD_HINT = "K = Kåpa, S = Stos, T = Tratt, A = Anemometer";

interface Props {
  inspectionId: string | null;
  userId: string;
}

export const FlowMeasurements = ({ inspectionId, userId }: Props) => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("flow_measurements")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("sort_order", { ascending: true });
      setLoading(false);
      if (error) { toast.error("Kunde inte ladda luftflöden"); return; }
      setApartments((data ?? []).map((d: any) => ({
        id: d.id,
        apartment_number: d.apartment_number ?? "",
        tenant_name: d.tenant_name ?? "",
        floor: d.floor ?? "",
        rooms: Array.isArray(d.rooms) ? d.rooms : [],
      })));
    };
    load();
  }, [inspectionId]);

  const addApartment = () => {
    setApartments((a) => [...a, {
      apartment_number: "",
      tenant_name: "",
      floor: "",
      rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
      _new: true,
      _dirty: true,
    }]);
  };

  const updateApt = (idx: number, patch: Partial<Apartment>) => {
    setApartments((a) => a.map((x, i) => i === idx ? { ...x, ...patch, _dirty: true } : x));
  };

  const updateRoom = (aptIdx: number, roomIdx: number, patch: Partial<Room>) => {
    setApartments((a) => a.map((x, i) => {
      if (i !== aptIdx) return x;
      return { ...x, _dirty: true, rooms: x.rooms.map((r, j) => j === roomIdx ? { ...r, ...patch } : r) };
    }));
  };

  const addRoom = (aptIdx: number) => {
    updateApt(aptIdx, { rooms: [...apartments[aptIdx].rooms, { name: "", projected_flow: "", measured_flow: "", method: "K" }] });
  };

  const removeRoom = (aptIdx: number, roomIdx: number) => {
    updateApt(aptIdx, { rooms: apartments[aptIdx].rooms.filter((_, j) => j !== roomIdx) });
  };

  const removeApartment = async (idx: number) => {
    const apt = apartments[idx];
    if (apt.id) {
      const { error } = await supabase.from("flow_measurements").delete().eq("id", apt.id);
      if (error) { toast.error("Kunde inte ta bort"); return; }
    }
    setApartments((a) => a.filter((_, i) => i !== idx));
  };

  const saveAll = async () => {
    if (!inspectionId) { toast.error("Spara protokollet först"); return; }
    const dirty = apartments.map((a, i) => ({ ...a, sort_order: i })).filter((a) => a._dirty);
    if (dirty.length === 0) { toast.success("Inget att spara"); return; }

    for (const apt of dirty) {
      const payload = {
        inspection_id: inspectionId,
        user_id: userId,
        apartment_number: apt.apartment_number,
        tenant_name: apt.tenant_name,
        floor: apt.floor,
        rooms: apt.rooms,
        sort_order: apt.sort_order ?? 0,
      };
      if (apt.id) {
        await supabase.from("flow_measurements").update(payload).eq("id", apt.id);
      } else {
        await supabase.from("flow_measurements").insert(payload);
      }
    }
    toast.success(`${dirty.length} lägenhet(er) sparade`);
    // reload
    const { data } = await supabase.from("flow_measurements").select("*").eq("inspection_id", inspectionId).order("sort_order");
    setApartments((data ?? []).map((d: any) => ({
      id: d.id,
      apartment_number: d.apartment_number ?? "",
      tenant_name: d.tenant_name ?? "",
      floor: d.floor ?? "",
      rooms: Array.isArray(d.rooms) ? d.rooms : [],
    })));
  };

  if (!inspectionId) {
    return (
      <Card className="p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">Luftflödesprotokoll</h2>
        <p className="text-sm text-muted-foreground">Spara protokollet först för att kunna lägga till luftflöden per lägenhet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">Luftflödesprotokoll</h2>
          <p className="text-xs text-muted-foreground mt-1">Per lägenhet/lokal. Värden i l/s. Mätmetod: {METHOD_HINT}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={saveAll}>Spara luftflöden</Button>
          <Button type="button" size="sm" onClick={addApartment}>
            <Plus className="w-4 h-4 mr-1" /> Lägenhet
          </Button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Laddar...</p>}

      {apartments.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground py-4 text-center">Inga lägenheter tillagda än.</p>
      )}

      <div className="space-y-4">
        {apartments.map((apt, i) => (
          <div key={apt.id ?? `new-${i}`} className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Home className="w-4 h-4 text-primary" />
                Lägenhet {apt.apartment_number || `#${i + 1}`}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeApartment(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Lgh nr</Label>
                <Input value={apt.apartment_number} onChange={(e) => updateApt(i, { apartment_number: e.target.value })} placeholder="1001" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hyresgäst</Label>
                <Input value={apt.tenant_name} onChange={(e) => updateApt(i, { tenant_name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Våning</Label>
                <Input value={apt.floor} onChange={(e) => updateApt(i, { floor: e.target.value })} placeholder="1 tr" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left py-2 pr-2 font-medium">Rum</th>
                    <th className="text-left py-2 px-2 font-medium">Proj. (l/s)</th>
                    <th className="text-left py-2 px-2 font-medium">Uppm. (l/s)</th>
                    <th className="text-left py-2 px-2 font-medium">Mätm.</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {apt.rooms.map((room, j) => (
                    <tr key={j} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 pr-2"><Input className="h-9" value={room.name} onChange={(e) => updateRoom(i, j, { name: e.target.value })} placeholder="Kök" /></td>
                      <td className="py-1.5 px-2"><Input className="h-9" inputMode="decimal" value={room.projected_flow} onChange={(e) => updateRoom(i, j, { projected_flow: e.target.value })} /></td>
                      <td className="py-1.5 px-2"><Input className="h-9" inputMode="decimal" value={room.measured_flow} onChange={(e) => updateRoom(i, j, { measured_flow: e.target.value })} /></td>
                      <td className="py-1.5 px-2"><Input className="h-9 w-16" value={room.method} onChange={(e) => updateRoom(i, j, { method: e.target.value })} /></td>
                      <td>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRoom(i, j)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => addRoom(i)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Lägg till rum
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
