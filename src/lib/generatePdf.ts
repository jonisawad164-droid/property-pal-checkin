import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadLogo, drawLogo, labeledCell, sectionTitle, fmt, TEXT, MUTED } from "./pdfShared";

type Inspection = Record<string, any>;
type FlowMeasurement = {
  apartment_number?: string | null;
  floor?: string | null;
  tenant_name?: string | null;
  system_number?: string | null;
  notes?: string | null;
  rooms: Array<{ name: string; projected_flow?: string; measured_flow?: string; method?: string }>;
};

const PAGE_W = 210;
const M = 12; // page margin
const CONTENT_W = PAGE_W - M * 2; // 186

/** Draw page header (logo + title + page number) */
const drawPageHeader = (doc: jsPDF, logo: string | null, page: number, total: number, propRef: string) => {
  // Logo top-left
  drawLogo(doc, logo, M, 10, 38);

  // Title (centered-ish, but per template more like centered between logo and right block)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text("Besiktningsprotokoll", PAGE_W / 2, 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Obligatorisk funktionskontroll av ventilationssystem", PAGE_W / 2, 19, { align: "center" });
  doc.text("(OVK) enligt BFS 2011:16, OVK 1", PAGE_W / 2, 22.5, { align: "center" });

  // Page indicator top-right
  doc.setFontSize(8.5);
  doc.text(`Sida ${page} av ${total}`, PAGE_W - M, 12, { align: "right" });

  // Sub-header band on page 2+
  if (page > 1) {
    doc.setFontSize(8.5);
    doc.text("OVK enl BFS 2011:16, OVK 1", M, 30);
    doc.text(`${propRef}`, PAGE_W - M - 30, 30, { align: "right" });
    doc.text(`Sida ${page} av ${total}`, PAGE_W - M, 30, { align: "right" });
  }
};

const drawRefStampBox = (doc: jsPDF, y: number, refNumber: string) => {
  // Right-side reference + FunkiS box (matches template)
  const x = M + CONTENT_W - 80; // box width 80
  const w = 80;
  // Top row: Referens nr + FunkiS A
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(x, y, 60, 8);
  doc.rect(x + 60, y, 20, 8);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Referens nr:", x + 1.5, y + 3);
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  doc.text(fmt(refNumber), x + 18, y + 5.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FunkiS A", x + 60 + 10, y + 5.3, { align: "center" });
  doc.setFont("helvetica", "normal");
  // Bottom: Plats för stämpel
  doc.rect(x, y + 8, 80, 22);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Plats för stämpel", x + 1.5, y + 11);
};

/** Page 1: header sections (Fastigheten, Besiktningsman, Besiktningsutlåtande, Allmänna omdöme) */
const drawPage1 = (doc: jsPDF, ins: Inspection, logo: string | null, totalPages: number) => {
  drawPageHeader(doc, logo, 1, totalPages, ins.property_designation ?? "");
  drawRefStampBox(doc, 30, ins.reference_number ?? "");

  // === FASTIGHETEN ===
  let y = 64;
  sectionTitle(doc, M, y, "Fastigheten");
  y += 2;

  // Row 1: Fastighetsbet | Adress | Postnr | Ort  (widths: 70, 66, 24, 26)
  const w1 = [70, 66, 24, 26];
  let x = M;
  labeledCell(doc, x, y, w1[0], 9, "Fastighetsbeteckning/Byggnadsnummer", ins.property_designation); x += w1[0];
  labeledCell(doc, x, y, w1[1], 9, "Byggnadens adress", ins.building_address); x += w1[1];
  labeledCell(doc, x, y, w1[2], 9, "Postnr", ins.building_postal_code); x += w1[2];
  labeledCell(doc, x, y, w1[3], 9, "Ort", ins.building_city);
  y += 9;

  // Row 2: Byggnadsägare | Postadress | Postnr | Ort
  x = M;
  labeledCell(doc, x, y, w1[0], 9, "Byggnadsägare", ins.owner_name); x += w1[0];
  labeledCell(doc, x, y, w1[1], 9, "Postadress", ins.owner_address); x += w1[1];
  labeledCell(doc, x, y, w1[2], 9, "Postnr", ins.owner_postal_code); x += w1[2];
  labeledCell(doc, x, y, w1[3], 9, "Ort", ins.owner_city);
  y += 9;

  // Row 3: Faktureringsadress
  x = M;
  labeledCell(doc, x, y, w1[0], 9, "Faktureringsadress", ins.billing_name); x += w1[0];
  labeledCell(doc, x, y, w1[1], 9, "Postadress", ins.billing_address); x += w1[1];
  labeledCell(doc, x, y, w1[2], 9, "Postnr", ins.billing_postal_code); x += w1[2];
  labeledCell(doc, x, y, w1[3], 9, "Ort", ins.billing_city);
  y += 9;

  // Row 4: Fastighetsansvarig | Tel | Fax | e-post  (widths: 70, 36, 30, 50)
  const w2 = [70, 36, 30, 50];
  x = M;
  labeledCell(doc, x, y, w2[0], 9, "Fastighetsansvarig/Förvaltare", ins.property_manager_name); x += w2[0];
  labeledCell(doc, x, y, w2[1], 9, "Telefonnummer", ins.property_manager_phone); x += w2[1];
  labeledCell(doc, x, y, w2[2], 9, "Fax", ""); x += w2[2];
  labeledCell(doc, x, y, w2[3], 9, "e-post", ins.property_manager_email);
  y += 9;

  // Row 5: Driftansvar
  x = M;
  labeledCell(doc, x, y, w2[0], 9, "Driftansvar", ins.operations_name); x += w2[0];
  labeledCell(doc, x, y, w2[1], 9, "Telefonnummer", ins.operations_phone); x += w2[1];
  labeledCell(doc, x, y, w2[2], 9, "Fax", ""); x += w2[2];
  labeledCell(doc, x, y, w2[3], 9, "e-post", ins.operations_email);
  y += 9;

  // Row 6: Kommun | Postadress | Postnr | Ort
  x = M;
  labeledCell(doc, x, y, w1[0], 9, "Kommun", ins.municipality_name); x += w1[0];
  labeledCell(doc, x, y, w1[1], 9, "Postadress", ins.municipality_address); x += w1[1];
  labeledCell(doc, x, y, w1[2], 9, "Postnr", ins.municipality_postal_code); x += w1[2];
  labeledCell(doc, x, y, w1[3], 9, "Ort", ins.municipality_city);
  y += 9;

  // Row 7: Internt namn | Internt nr | Verksamhet | Bruksarea | Antal lgh | Antal lokaler
  const w3 = [44, 26, 40, 26, 25, 25];
  x = M;
  labeledCell(doc, x, y, w3[0], 9, "Internt byggnadsnamn", ins.internal_building_name); x += w3[0];
  labeledCell(doc, x, y, w3[1], 9, "Internt nummer", ins.internal_number); x += w3[1];
  labeledCell(doc, x, y, w3[2], 9, "Verksamhet", ins.activity); x += w3[2];
  labeledCell(doc, x, y, w3[3], 9, "Bruksarea", ins.usable_area); x += w3[3];
  labeledCell(doc, x, y, w3[4], 9, "Antal lägenheter", ins.number_of_apartments); x += w3[4];
  labeledCell(doc, x, y, w3[5], 9, "Antal lokaler", ins.number_of_premises);
  y += 14;

  // === BESIKTNINGSMAN ===
  sectionTitle(doc, M, y, "Besiktningsman");
  y += 2;

  // Row 1: Sakkunnig | Företag | Adress | Postnr | Ort  (widths: 50, 50, 44, 20, 22)
  const wB1 = [50, 50, 44, 20, 22];
  x = M;
  labeledCell(doc, x, y, wB1[0], 9, "Sakkunnig", ins.inspector_name); x += wB1[0];
  labeledCell(doc, x, y, wB1[1], 9, "Företag", ins.inspector_company); x += wB1[1];
  labeledCell(doc, x, y, wB1[2], 9, "Adress", ins.inspector_address); x += wB1[2];
  labeledCell(doc, x, y, wB1[3], 9, "Postnr", ins.inspector_postal_code); x += wB1[3];
  labeledCell(doc, x, y, wB1[4], 9, "Ort", ins.inspector_city);
  y += 9;

  // Row 2: Telefon | Fax | e-post | FunkiS medlnr | Underskrift  (widths: 32, 22, 60, 30, 42)
  const wB2 = [32, 22, 60, 30, 42];
  x = M;
  labeledCell(doc, x, y, wB2[0], 11, "Telefon", ins.inspector_phone); x += wB2[0];
  labeledCell(doc, x, y, wB2[1], 11, "Fax", ""); x += wB2[1];
  labeledCell(doc, x, y, wB2[2], 11, "e-post", ins.inspector_email); x += wB2[2];
  labeledCell(doc, x, y, wB2[3], 11, "FunkiS medlnr", ins.inspector_funkis_number); x += wB2[3];
  labeledCell(doc, x, y, wB2[4], 11, "Underskrift", "");
  y += 11;

  // Row 3: Behörighet | Certifikatnr | Cert-org | Giltighetstid | Underskriftsdatum
  const wB3 = [32, 22, 60, 30, 42];
  x = M;
  labeledCell(doc, x, y, wB3[0], 9, "Behörighet", ins.inspector_certification); x += wB3[0];
  labeledCell(doc, x, y, wB3[1], 9, "Certifikatnr", ins.inspector_certificate_number); x += wB3[1];
  labeledCell(doc, x, y, wB3[2], 9, "Cert-org", ins.inspector_certificate_org); x += wB3[2];
  labeledCell(doc, x, y, wB3[3], 9, "Giltighetstid", ins.inspector_certificate_valid_until); x += wB3[3];
  labeledCell(doc, x, y, wB3[4], 9, "Underskriftsdatum", ins.signature_date);
  y += 11;

  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Protokoll med bilagor finns hos byggnadsnämnden och fastighetsägaren.", PAGE_W / 2, y, { align: "center" });
  y += 6;

  // === BESIKTNINGSUTLÅTANDE ===
  // Bordered group with title bar inside
  const utlStartY = y;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  // Outer frame of section (we'll close after table)
  // Title row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text("Besiktningsutlåtande", M + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("(+ sammanställning av system inom byggnaden)", M + 50, y + 5);
  y += 8;

  // "Ingår samtliga" row
  doc.rect(M, y, CONTENT_W, 7);
  doc.setFontSize(8.5);
  doc.text("Ingår samtliga vent.system för byggnaden i denna besiktning", M + 2, y + 4.5);
  // Checkboxes
  const cbX = M + 100;
  doc.rect(cbX, y + 1.8, 3, 3);
  if (ins.all_systems_included === true) {
    doc.setFont("helvetica", "bold");
    doc.text("✓", cbX + 0.6, y + 4.4);
    doc.setFont("helvetica", "normal");
  }
  doc.text("Ja", cbX + 4.5, y + 4.5);
  doc.rect(cbX + 12, y + 1.8, 3, 3);
  if (ins.all_systems_included === false) {
    doc.setFont("helvetica", "bold");
    doc.text("✓", cbX + 12.6, y + 4.4);
    doc.setFont("helvetica", "normal");
  }
  doc.text("Nej", cbX + 16.5, y + 4.5);
  doc.text("Besiktningsresultat: EG = Ej Godkänt, G = Godkänt", M + CONTENT_W - 2, y + 4.5, { align: "right" });
  y += 7;

  // System table
  autoTable(doc, {
    startY: y,
    head: [[
      "Systemnr",
      "Besiktn.\nintervall",
      "Besiktning",
      "Besiktn-\nresultat",
      "Ombesiktning\nsenast",
      "Nästa besiktning",
      "Mätprotokoll\n(bil) nr",
      "Gällande\nventilationsnorm",
    ]],
    body: [[
      fmt(ins.system_number),
      fmt(ins.inspection_interval),
      fmt(ins.inspection_date),
      fmt(ins.inspection_result),
      fmt(ins.reinspection_deadline),
      fmt(ins.next_inspection_date),
      fmt(ins.measurement_protocol_number),
      fmt(ins.ventilation_norm),
    ]],
    theme: "grid",
    margin: { left: M, right: M },
    tableWidth: CONTENT_W,
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: TEXT as any,
      fontStyle: "normal",
      fontSize: 7.5,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      cellPadding: 2,
    },
    columnStyles: { 3: { fontStyle: "bold" } },
  });
  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 8;

  // === ALLMÄNNA OMDÖME ===
  if (y < 240) {
    sectionTitle(doc, M, y, "Allmänna omdöme, Kommentarer");
    y += 2;
    const boxH = Math.min(60, 287 - y - 8);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(M, y, CONTENT_W, boxH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const txt = fmt(ins.general_comments);
    if (txt) {
      const split = doc.splitTextToSize(txt, CONTENT_W - 4);
      doc.text(split, M + 2, y + 5);
    }
  }
};

/** Page 2: Systeminformation table + signature footer */
const drawPage2 = (doc: jsPDF, ins: Inspection, logo: string | null, totalPages: number) => {
  drawPageHeader(doc, logo, 2, totalPages, ins.property_designation ?? "");

  let y = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text(`Systeminformation - ${fmt(ins.system_number) || ""}`, M, y);
  y += 3;

  // Row 1: Systemnr | Flöde börvärde | Systemtyp | Besiktningstyp | OVKnr | Byggår | Ombyggår
  const r1 = [26, 30, 22, 50, 16, 18, 24];
  let x = M;
  labeledCell(doc, x, y, r1[0], 9, "Systemnr", ins.system_number); x += r1[0];
  labeledCell(doc, x, y, r1[1], 9, "Flöde börvärde:", ins.flow_setpoint); x += r1[1];
  labeledCell(doc, x, y, r1[2], 9, "Systemtyp:", ins.system_type); x += r1[2];
  labeledCell(doc, x, y, r1[3], 9, "Besiktningstyp:", ins.inspection_type); x += r1[3];
  labeledCell(doc, x, y, r1[4], 9, "OVKnr:", ins.ovk_number); x += r1[4];
  labeledCell(doc, x, y, r1[5], 9, "Byggår:", ins.build_year); x += r1[5];
  labeledCell(doc, x, y, r1[6], 9, "Ombyggår:", ins.rebuild_year);
  y += 9;

  // Row 2: Betjänar | Placering
  x = M;
  labeledCell(doc, x, y, 93, 9, "Betjänar:", ins.serves); x += 93;
  labeledCell(doc, x, y, 93, 9, "Placering:", ins.location);
  y += 9;

  // Row 3: Samkör | Driftstid helfart | Driftstid delfart
  x = M;
  labeledCell(doc, x, y, 62, 9, "Samkör:", ins.cooperates_with); x += 62;
  labeledCell(doc, x, y, 62, 9, "Driftstid helfart:", ins.full_speed_runtime); x += 62;
  labeledCell(doc, x, y, 62, 9, "Driftstid delfart:", ins.partial_speed_runtime);
  y += 9;

  // Row 4: Tidigare OVK | Ritnnr | Ritndatum | Flödesprotnr | Flödesprotdatum | Övrigdok
  const r4 = [38, 26, 26, 26, 30, 40];
  x = M;
  labeledCell(doc, x, y, r4[0], 9, "Tidigare OVK besiktn", ins.previous_inspection_date); x += r4[0];
  labeledCell(doc, x, y, r4[1], 9, "Ritnnr:", ins.drawing_number); x += r4[1];
  labeledCell(doc, x, y, r4[2], 9, "Ritndatum:", ins.drawing_date); x += r4[2];
  labeledCell(doc, x, y, r4[3], 9, "Flödesprotnr:", ins.flow_protocol_number); x += r4[3];
  labeledCell(doc, x, y, r4[4], 9, "Flödesprotdatum:", ins.flow_protocol_date); x += r4[4];
  labeledCell(doc, x, y, r4[5], 9, "Övrigdok:", ins.other_documents);
  y += 9;

  // Row 5: Ej kontrollerat Del | Ej kontrollerat Orsak
  x = M;
  labeledCell(doc, x, y, 93, 11, "Ej kontrollerat Del:", ins.not_checked_part); x += 93;
  labeledCell(doc, x, y, 93, 11, "Ej kontrollerat Orsak", ins.not_checked_reason);
  y += 14;

  // Footer (bottom of page): inspector name | company | phone
  const footY = 285;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text(fmt(ins.inspector_name), M, footY);
  doc.text(fmt(ins.inspector_company), PAGE_W / 2, footY, { align: "center" });
  doc.text(fmt(ins.inspector_phone), PAGE_W - M, footY, { align: "right" });
};

/** Optional flow appendix */
const drawFlowAppendix = (doc: jsPDF, flows: FlowMeasurement[], logo: string | null, ins: Inspection, pageNum: number, totalPages: number) => {
  drawPageHeader(doc, logo, pageNum, totalPages, ins.property_designation ?? "");
  let y = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text("Bilaga – Luftflödesprotokoll", M, y);
  y += 4;

  for (const apt of flows) {
    if (y > 250) {
      doc.addPage();
      drawPageHeader(doc, logo, ++pageNum, totalPages, ins.property_designation ?? "");
      y = 40;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Lägenhet ${fmt(apt.apartment_number)}${apt.floor ? ` • Vån ${apt.floor}` : ""}${apt.tenant_name ? ` • ${apt.tenant_name}` : ""}${apt.system_number ? ` • System ${apt.system_number}` : ""}`,
      M,
      y
    );
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [["Rum", "Proj. (l/s)", "Uppm. (l/s)", "Mätmetod"]],
      body: (apt.rooms ?? []).map((r) => [fmt(r.name), fmt(r.projected_flow), fmt(r.measured_flow), fmt(r.method)]),
      theme: "grid",
      margin: { left: M, right: M },
      headStyles: { fillColor: [240, 240, 240], textColor: TEXT as any, fontSize: 8.5, lineColor: [0, 0, 0], lineWidth: 0.2 },
      bodyStyles: { fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding: 1.6 },
    });
    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 3;
    if (apt.notes) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      const split = doc.splitTextToSize(`Anm: ${apt.notes}`, CONTENT_W);
      doc.text(split, M, y);
      y += split.length * 4;
    }
    y += 4;
  }
};

export const generateOvkPdf = async (inspection: Inspection, flows: FlowMeasurement[]): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogo();

  const totalPages = 2 + (flows.length > 0 ? 1 : 0);
  drawPage1(doc, inspection, logo, totalPages);
  doc.addPage();
  drawPage2(doc, inspection, logo, totalPages);
  if (flows.length > 0) {
    doc.addPage();
    drawFlowAppendix(doc, flows, logo, inspection, 3, totalPages);
  }

  return doc;
};
