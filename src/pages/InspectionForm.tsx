import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FlowMeasurements } from "@/components/FlowMeasurements";

type FormState = Record<string, any>;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5 sm:p-6">
    <h2 className="text-base font-semibold text-foreground mb-4 pb-3 border-b border-border">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </Card>
);

const Field = ({ label, id, children, full }: { label: string; id: string; children: React.ReactNode; full?: boolean }) => (
  <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
    <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const submitSchema = z.object({
  property_designation: z.string().trim().min(1, "Fastighetsbeteckning krävs").max(200),
  building_address: z.string().trim().min(1, "Adress krävs").max(200),
  recipient_email: z.string().trim().email("Ogiltig e-post").max(255).optional().or(z.literal("")),
});

const InspectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : id ?? null);
  const [userId, setUserId] = useState<string>("");
  const [form, setForm] = useState<FormState>({
    all_systems_included: true,
    inspection_date: new Date().toISOString().slice(0, 10),
    signature_date: new Date().toISOString().slice(0, 10),
    ventilation_norm: "BBR 12 (lila)",
    inspection_result: "G",
  });

  useEffect(() => {
    const load = async () => {
      // Prefill inspector fields from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

      if (!isNew && id) {
        setLoading(true);
        const { data, error } = await supabase.from("inspections").select("*").eq("id", id).maybeSingle();
        setLoading(false);
        if (error || !data) { toast.error("Kunde inte ladda"); navigate("/"); return; }
        setForm(data);
      } else if (profile) {
        setForm((f) => ({
          ...f,
          inspector_name: profile.full_name ?? "",
          inspector_company: profile.company ?? "",
          inspector_phone: profile.phone ?? "",
          inspector_email: profile.email ?? "",
          inspector_funkis_number: profile.funkis_number ?? "",
          inspector_certification: profile.certification ?? "",
          inspector_certificate_number: profile.certificate_number ?? "",
          inspector_certificate_org: profile.certificate_org ?? "",
          inspector_certificate_valid_until: profile.certificate_valid_until ?? "",
        }));
      }
    };
    load();
  }, [id, isNew, navigate]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (sendEmail = false) => {
    const parsed = submitSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    // Clean: empty strings → null for date fields
    const dateFields = ["inspection_date","reinspection_deadline","next_inspection_date","signature_date","previous_inspection_date","drawing_date","flow_protocol_date","inspector_certificate_valid_until"];
    const payload: any = { ...form, user_id: user.id };
    dateFields.forEach((f) => { if (payload[f] === "") payload[f] = null; });
    payload.status = sendEmail ? "sent" : (form.status === "sent" ? "sent" : "completed");

    let newId = savedId ?? id ?? null;
    if (!newId || isNew && !savedId) {
      const { data, error } = await supabase.from("inspections").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      newId = data.id;
      setSavedId(newId);
    } else {
      const { error } = await supabase.from("inspections").update(payload).eq("id", newId);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }

    if (sendEmail) {
      toast.success("Sparat. E-postutskick aktiveras i nästa steg.");
      setSaving(false);
      navigate("/");
    } else {
      toast.success("Sparat – du kan nu lägga till luftflöden");
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><div className="text-center py-12 text-muted-foreground">Laddar...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isNew ? "Nytt OVK-protokoll" : "Redigera protokoll"}
          </h1>
          <p className="text-sm text-muted-foreground">Obligatorisk funktionskontroll av ventilationssystem</p>
        </div>
      </div>

      <div className="space-y-5">
        <Section title="Fastighet">
          <Field label="Referensnr" id="ref"><Input id="ref" value={form.reference_number ?? ""} onChange={(e) => set("reference_number", e.target.value)} /></Field>
          <Field label="Fastighetsbeteckning *" id="pd"><Input id="pd" value={form.property_designation ?? ""} onChange={(e) => set("property_designation", e.target.value)} /></Field>
          <Field label="Byggnadens adress *" id="ba" full><Input id="ba" value={form.building_address ?? ""} onChange={(e) => set("building_address", e.target.value)} /></Field>
          <Field label="Postnr" id="bp"><Input id="bp" value={form.building_postal_code ?? ""} onChange={(e) => set("building_postal_code", e.target.value)} /></Field>
          <Field label="Ort" id="bc"><Input id="bc" value={form.building_city ?? ""} onChange={(e) => set("building_city", e.target.value)} /></Field>
          <Field label="Internt byggnadsnamn" id="ibn"><Input id="ibn" value={form.internal_building_name ?? ""} onChange={(e) => set("internal_building_name", e.target.value)} /></Field>
          <Field label="Verksamhet" id="act"><Input id="act" value={form.activity ?? ""} onChange={(e) => set("activity", e.target.value)} /></Field>
          <Field label="Bruksarea" id="ua"><Input id="ua" value={form.usable_area ?? ""} onChange={(e) => set("usable_area", e.target.value)} /></Field>
          <Field label="Antal lägenheter" id="apt"><Input id="apt" value={form.number_of_apartments ?? ""} onChange={(e) => set("number_of_apartments", e.target.value)} /></Field>
        </Section>

        <Section title="Byggnadsägare">
          <Field label="Namn" id="on" full><Input id="on" value={form.owner_name ?? ""} onChange={(e) => set("owner_name", e.target.value)} /></Field>
          <Field label="Postadress" id="oa"><Input id="oa" value={form.owner_address ?? ""} onChange={(e) => set("owner_address", e.target.value)} /></Field>
          <Field label="Postnr" id="op"><Input id="op" value={form.owner_postal_code ?? ""} onChange={(e) => set("owner_postal_code", e.target.value)} /></Field>
          <Field label="Ort" id="oc"><Input id="oc" value={form.owner_city ?? ""} onChange={(e) => set("owner_city", e.target.value)} /></Field>
        </Section>

        <Section title="Fastighetsansvarig / Driftansvar">
          <Field label="Fastighetsansvarig" id="pmn"><Input id="pmn" value={form.property_manager_name ?? ""} onChange={(e) => set("property_manager_name", e.target.value)} /></Field>
          <Field label="Telefon" id="pmp"><Input id="pmp" value={form.property_manager_phone ?? ""} onChange={(e) => set("property_manager_phone", e.target.value)} /></Field>
          <Field label="Driftansvar" id="opn"><Input id="opn" value={form.operations_name ?? ""} onChange={(e) => set("operations_name", e.target.value)} /></Field>
          <Field label="Telefon" id="opp"><Input id="opp" value={form.operations_phone ?? ""} onChange={(e) => set("operations_phone", e.target.value)} /></Field>
          <Field label="Kommun" id="mn"><Input id="mn" value={form.municipality_name ?? ""} onChange={(e) => set("municipality_name", e.target.value)} /></Field>
        </Section>

        <Section title="Besiktningsman">
          <Field label="Sakkunnig" id="in"><Input id="in" value={form.inspector_name ?? ""} onChange={(e) => set("inspector_name", e.target.value)} /></Field>
          <Field label="Företag" id="ic"><Input id="ic" value={form.inspector_company ?? ""} onChange={(e) => set("inspector_company", e.target.value)} /></Field>
          <Field label="Telefon" id="ip"><Input id="ip" value={form.inspector_phone ?? ""} onChange={(e) => set("inspector_phone", e.target.value)} /></Field>
          <Field label="E-post" id="ie"><Input id="ie" type="email" value={form.inspector_email ?? ""} onChange={(e) => set("inspector_email", e.target.value)} /></Field>
          <Field label="FunkiS medlemsnr" id="ifn"><Input id="ifn" value={form.inspector_funkis_number ?? ""} onChange={(e) => set("inspector_funkis_number", e.target.value)} /></Field>
          <Field label="Behörighet" id="ib"><Input id="ib" placeholder="t.ex. Riks K" value={form.inspector_certification ?? ""} onChange={(e) => set("inspector_certification", e.target.value)} /></Field>
          <Field label="Certifikatnr" id="icn"><Input id="icn" value={form.inspector_certificate_number ?? ""} onChange={(e) => set("inspector_certificate_number", e.target.value)} /></Field>
          <Field label="Cert-organ" id="ico"><Input id="ico" value={form.inspector_certificate_org ?? ""} onChange={(e) => set("inspector_certificate_org", e.target.value)} /></Field>
          <Field label="Giltighetstid" id="icv"><Input id="icv" type="date" value={form.inspector_certificate_valid_until ?? ""} onChange={(e) => set("inspector_certificate_valid_until", e.target.value)} /></Field>
          <Field label="Underskriftsdatum" id="sd"><Input id="sd" type="date" value={form.signature_date ?? ""} onChange={(e) => set("signature_date", e.target.value)} /></Field>
        </Section>

        <Section title="Besiktningsutlåtande">
          <Field label="Systemnr" id="sn"><Input id="sn" placeholder="t.ex. LA01" value={form.system_number ?? ""} onChange={(e) => set("system_number", e.target.value)} /></Field>
          <Field label="Besiktningsintervall" id="ii"><Input id="ii" placeholder="t.ex. 3 år" value={form.inspection_interval ?? ""} onChange={(e) => set("inspection_interval", e.target.value)} /></Field>
          <Field label="Besiktningsdatum" id="id"><Input id="id" type="date" value={form.inspection_date ?? ""} onChange={(e) => set("inspection_date", e.target.value)} /></Field>
          <Field label="Resultat" id="ir">
            <Select value={form.inspection_result ?? ""} onValueChange={(v) => set("inspection_result", v)}>
              <SelectTrigger id="ir"><SelectValue placeholder="Välj..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="G">G – Godkänd</SelectItem>
                <SelectItem value="EG">EG – Ej godkänd</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ombesiktning senast" id="rd"><Input id="rd" type="date" value={form.reinspection_deadline ?? ""} onChange={(e) => set("reinspection_deadline", e.target.value)} /></Field>
          <Field label="Nästa besiktning" id="ni"><Input id="ni" type="date" value={form.next_inspection_date ?? ""} onChange={(e) => set("next_inspection_date", e.target.value)} /></Field>
          <Field label="Mätprotokoll (bil) nr" id="mp"><Input id="mp" value={form.measurement_protocol_number ?? ""} onChange={(e) => set("measurement_protocol_number", e.target.value)} /></Field>
          <Field label="Ventilationsnorm" id="vn"><Input id="vn" value={form.ventilation_norm ?? ""} onChange={(e) => set("ventilation_norm", e.target.value)} /></Field>
        </Section>

        <Section title="Systeminformation">
          <Field label="Flöde börvärde" id="fs"><Input id="fs" value={form.flow_setpoint ?? ""} onChange={(e) => set("flow_setpoint", e.target.value)} /></Field>
          <Field label="Systemtyp" id="st"><Input id="st" placeholder="t.ex. FTX" value={form.system_type ?? ""} onChange={(e) => set("system_type", e.target.value)} /></Field>
          <Field label="Besiktningstyp" id="it"><Input id="it" placeholder="Återkommande besiktning" value={form.inspection_type ?? ""} onChange={(e) => set("inspection_type", e.target.value)} /></Field>
          <Field label="OVKnr" id="on2"><Input id="on2" value={form.ovk_number ?? ""} onChange={(e) => set("ovk_number", e.target.value)} /></Field>
          <Field label="Byggår" id="by"><Input id="by" value={form.build_year ?? ""} onChange={(e) => set("build_year", e.target.value)} /></Field>
          <Field label="Ombyggår" id="ry"><Input id="ry" value={form.rebuild_year ?? ""} onChange={(e) => set("rebuild_year", e.target.value)} /></Field>
          <Field label="Betjänar" id="srv"><Input id="srv" value={form.serves ?? ""} onChange={(e) => set("serves", e.target.value)} /></Field>
          <Field label="Placering" id="loc"><Input id="loc" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Driftstid helfart" id="fr"><Input id="fr" value={form.full_speed_runtime ?? ""} onChange={(e) => set("full_speed_runtime", e.target.value)} /></Field>
          <Field label="Driftstid delfart" id="pr"><Input id="pr" value={form.partial_speed_runtime ?? ""} onChange={(e) => set("partial_speed_runtime", e.target.value)} /></Field>
        </Section>

        <Section title="Allmänna kommentarer">
          <Field label="Kommentarer / utlåtande" id="gc" full>
            <Textarea id="gc" rows={5} value={form.general_comments ?? ""} onChange={(e) => set("general_comments", e.target.value)} />
          </Field>
        </Section>

        <Section title="Skicka till kollega">
          <Field label="Mottagarens namn" id="rn"><Input id="rn" value={form.recipient_name ?? ""} onChange={(e) => set("recipient_name", e.target.value)} /></Field>
          <Field label="Mottagarens e-post" id="re"><Input id="re" type="email" value={form.recipient_email ?? ""} onChange={(e) => set("recipient_email", e.target.value)} /></Field>
        </Section>

        <div className="flex flex-wrap gap-3 justify-end sticky bottom-4 bg-background/80 backdrop-blur p-3 rounded-lg border border-border shadow-[var(--shadow-elevated)]">
          <Button variant="outline" onClick={() => navigate("/")} disabled={saving}>Avbryt</Button>
          <Button variant="secondary" onClick={() => save(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Spara
          </Button>
          <Button onClick={() => save(true)} disabled={saving || !form.recipient_email}>
            <Send className="w-4 h-4 mr-2" />
            Spara & skicka
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default InspectionForm;
