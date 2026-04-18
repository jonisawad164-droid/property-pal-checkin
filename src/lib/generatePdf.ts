import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAVIDA_YELLOW: [number, number, number] = [255, 204, 0];
const BRAVIDA_DARK: [number, number, number] = [30, 30, 30];

type Inspection = Record<string, any>;
type FlowMeasurement = {
  apartment_number?: string | null;
  floor?: string | null;
  tenant_name?: string | null;
  system_number?: string | null;
  notes?: string | null;
  rooms: Array<{ name: string; projected_flow?: string; measured_flow?: string; method?: string }>;
};

const fmt = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v));

const drawHeader = (doc: jsPDF, title: string) => {
  const w = doc.internal.pageSize.getWidth();
  // Yellow band
  doc.setFillColor(...BRAVIDA_YELLOW);
  doc.rect(0, 0, w, 22, "F");
  // Logo placeholder
  doc.setTextColor(...BRAVIDA_DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("BRAVIDA", 14, 15);
  // Title right
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(title, w - 14, 14, { align: "right" });
};

const drawFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Sida ${i} av ${pageCount}`, w - 14, h - 8, { align: "right" });
    doc.text("OVK-protokoll", 14, h - 8);
  }
};

const section = (doc: jsPDF, title: string, rows: Array<[string, any]>, startY: number): number => {
  // Section title bar
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 245, 245);
  doc.rect(14, startY, w - 28, 7, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAVIDA_DARK);
  doc.text(title, 16, startY + 5);

  autoTable(doc, {
    startY: startY + 8,
    body: rows.map(([k, v]) => [k, fmt(v)]),
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.5, textColor: [40, 40, 40] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55, textColor: [90, 90, 90] },
      1: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  return doc.lastAutoTable.finalY + 4;
};

export const generateOvkPdf = (inspection: Inspection, flows: FlowMeasurement[]): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, "Protokoll – Obligatorisk ventilationskontroll");

  let y = 28;

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAVIDA_DARK);
  doc.text("OVK-protokoll", 14, y);
  y += 2;
  doc.setDrawColor(...BRAVIDA_YELLOW);
  doc.setLineWidth(0.8);
  doc.line(14, y + 1, 196, y + 1);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Referensnr: ${fmt(inspection.reference_number)}`, 14, y);
  doc.text(
    `Resultat: ${inspection.inspection_result === "G" ? "Godkänd" : inspection.inspection_result === "EG" ? "Ej godkänd" : "—"}`,
    196,
    y,
    { align: "right" }
  );
  y += 6;

  y = section(doc, "Fastighet", [
    ["Fastighetsbeteckning", inspection.property_designation],
    ["Adress", inspection.building_address],
    ["Postnr / Ort", `${fmt(inspection.building_postal_code)} ${fmt(inspection.building_city)}`],
    ["Internt byggnadsnamn", inspection.internal_building_name],
    ["Verksamhet", inspection.activity],
    ["Bruksarea", inspection.usable_area],
    ["Antal lägenheter", inspection.number_of_apartments],
  ], y);

  y = section(doc, "Byggnadsägare", [
    ["Namn", inspection.owner_name],
    ["Adress", inspection.owner_address],
    ["Postnr / Ort", `${fmt(inspection.owner_postal_code)} ${fmt(inspection.owner_city)}`],
  ], y);

  y = section(doc, "Fastighetsansvarig / Driftansvar", [
    ["Fastighetsansvarig", inspection.property_manager_name],
    ["Telefon", inspection.property_manager_phone],
    ["Driftansvar", inspection.operations_name],
    ["Telefon", inspection.operations_phone],
    ["Kommun", inspection.municipality_name],
  ], y);

  if (y > 240) { doc.addPage(); drawHeader(doc, "Protokoll – OVK"); y = 28; }

  y = section(doc, "Besiktningsutlåtande", [
    ["Systemnr", inspection.system_number],
    ["Besiktningsdatum", inspection.inspection_date],
    ["Besiktningsintervall", inspection.inspection_interval],
    ["Resultat", inspection.inspection_result === "G" ? "G – Godkänd" : inspection.inspection_result === "EG" ? "EG – Ej godkänd" : "—"],
    ["Ombesiktning senast", inspection.reinspection_deadline],
    ["Nästa besiktning", inspection.next_inspection_date],
    ["Mätprotokoll nr", inspection.measurement_protocol_number],
    ["Ventilationsnorm", inspection.ventilation_norm],
  ], y);

  if (y > 230) { doc.addPage(); drawHeader(doc, "Protokoll – OVK"); y = 28; }

  y = section(doc, "Systeminformation", [
    ["Systemtyp", inspection.system_type],
    ["Besiktningstyp", inspection.inspection_type],
    ["OVK-nr", inspection.ovk_number],
    ["Byggår / Ombyggår", `${fmt(inspection.build_year)} / ${fmt(inspection.rebuild_year)}`],
    ["Betjänar", inspection.serves],
    ["Placering", inspection.location],
    ["Flöde börvärde", inspection.flow_setpoint],
    ["Driftstid helfart / delfart", `${fmt(inspection.full_speed_runtime)} / ${fmt(inspection.partial_speed_runtime)}`],
  ], y);

  if (y > 240) { doc.addPage(); drawHeader(doc, "Protokoll – OVK"); y = 28; }

  y = section(doc, "Besiktningsman", [
    ["Sakkunnig", inspection.inspector_name],
    ["Företag", inspection.inspector_company],
    ["Telefon", inspection.inspector_phone],
    ["E-post", inspection.inspector_email],
    ["FunkiS medlemsnr", inspection.inspector_funkis_number],
    ["Behörighet", inspection.inspector_certification],
    ["Certifikatnr / Organ", `${fmt(inspection.inspector_certificate_number)} / ${fmt(inspection.inspector_certificate_org)}`],
    ["Cert. giltigt t.o.m.", inspection.inspector_certificate_valid_until],
    ["Underskriftsdatum", inspection.signature_date],
  ], y);

  if (inspection.general_comments) {
    if (y > 240) { doc.addPage(); drawHeader(doc, "Protokoll – OVK"); y = 28; }
    y = section(doc, "Allmänna kommentarer", [["Utlåtande", inspection.general_comments]], y);
  }

  // Signature
  if (y > 250) { doc.addPage(); drawHeader(doc, "Protokoll – OVK"); y = 28; }
  y += 6;
  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  doc.line(14, y + 14, 90, y + 14);
  doc.line(110, y + 14, 196, y + 14);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Underskrift besiktningsman", 14, y + 18);
  doc.text(`Datum: ${fmt(inspection.signature_date)}`, 110, y + 18);

  // Flow protocol page(s)
  if (flows.length > 0) {
    doc.addPage();
    drawHeader(doc, "Bilaga – Luftflödesprotokoll");
    let fy = 28;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAVIDA_DARK);
    doc.text("Luftflödesprotokoll", 14, fy);
    doc.setDrawColor(...BRAVIDA_YELLOW);
    doc.line(14, fy + 2, 196, fy + 2);
    fy += 8;

    for (const apt of flows) {
      if (fy > 250) { doc.addPage(); drawHeader(doc, "Bilaga – Luftflödesprotokoll"); fy = 28; }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAVIDA_DARK);
      const aptHead = `Lägenhet ${fmt(apt.apartment_number)}${apt.floor ? ` • Vån ${apt.floor}` : ""}${apt.tenant_name ? ` • ${apt.tenant_name}` : ""}${apt.system_number ? ` • System ${apt.system_number}` : ""}`;
      doc.text(aptHead, 14, fy);
      fy += 3;

      autoTable(doc, {
        startY: fy,
        head: [["Rum", "Proj. (l/s)", "Uppm. (l/s)", "Mätmetod"]],
        body: (apt.rooms ?? []).map((r) => [
          fmt(r.name),
          fmt(r.projected_flow),
          fmt(r.measured_flow),
          fmt(r.method),
        ]),
        theme: "grid",
        headStyles: { fillColor: BRAVIDA_YELLOW, textColor: BRAVIDA_DARK, fontStyle: "bold", fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 1.8 },
        margin: { left: 14, right: 14 },
      });
      // @ts-ignore
      fy = doc.lastAutoTable.finalY + 2;

      if (apt.notes) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100);
        const split = doc.splitTextToSize(`Anm: ${apt.notes}`, 180);
        doc.text(split, 14, fy + 3);
        fy += split.length * 4 + 2;
      }
      fy += 4;
    }
  }

  drawFooter(doc);
  return doc;
};
