import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MapPin, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";

interface Inspection {
  id: string;
  property_designation: string;
  building_address: string;
  building_city: string | null;
  inspection_date: string | null;
  inspection_result: string | null;
  status: string;
  recipient_email: string | null;
  email_sent_at: string | null;
  created_at: string;
}

const Index = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select("id, property_designation, building_address, building_city, inspection_date, inspection_result, status, recipient_email, email_sent_at, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setInspections(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Besiktningar</h1>
          <p className="text-sm text-muted-foreground mt-1">Dina OVK-protokoll</p>
        </div>
        <Button asChild>
          <Link to="/inspections/new">
            <Plus className="w-4 h-4 mr-2" />
            Nytt protokoll
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground py-12 text-center">Laddar...</div>
      ) : inspections.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Inga besiktningar än</h3>
          <p className="text-sm text-muted-foreground mb-4">Skapa ditt första OVK-protokoll för att komma igång</p>
          <Button asChild>
            <Link to="/inspections/new">
              <Plus className="w-4 h-4 mr-2" />
              Skapa protokoll
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {inspections.map((insp) => (
            <Link to={`/inspections/${insp.id}`} key={insp.id}>
              <Card className="p-4 hover:shadow-[var(--shadow-elevated)] transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground truncate">{insp.property_designation}</h3>
                      {insp.inspection_result === "G" && (
                        <Badge className="bg-success text-success-foreground hover:bg-success">Godkänd</Badge>
                      )}
                      {insp.inspection_result === "EG" && (
                        <Badge variant="destructive">Ej godkänd</Badge>
                      )}
                      {insp.status === "draft" && <Badge variant="outline">Utkast</Badge>}
                      {insp.email_sent_at && (
                        <Badge variant="secondary" className="gap-1">
                          <Mail className="w-3 h-3" /> Skickad
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {insp.building_address}{insp.building_city ? `, ${insp.building_city}` : ""}
                      </span>
                      {insp.inspection_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(insp.inspection_date).toLocaleDateString("sv-SE")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
