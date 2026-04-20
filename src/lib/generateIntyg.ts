import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadLogo, drawLogo, fmt, TEXT, MUTED } from "./pdfShared";

type Inspection = Record<string, any>;

/**
 * Generate INTYG - OVK (single-page certificate to be posted in building).
 * Matches Bravida/FunkiS template layout.
 */
export const generateOvkIntyg = async (ins: Inspection): Promise<jsPDF> => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const logo = await loadLogo();

  const PAGE_W = 210;
  // Outer frame (centered, ~150mm wide x 180mm tall)
  const fw = 150;
  const fh = 180;
  const fx = (PAGE_W - fw) / 2;
  const fy = 25;
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(fx, fy, fw, fh);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...TEXT);
  doc.text("INTYG - OVK", fx + 8, fy + 14);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Obligatorisk funktionskontroll av ventilationssystem (OVK)", fx + 8, fy + 22);
  doc.text("enligt BFS 2011:16, OVK 1, har utförts i denna byggnad", fx + 8, fy + 27);

  // Property block
  let y = fy + 40;
  const labelX = fx + 8;
  const valueX = fx + 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  doc.text("Fastighetsbet:", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${fmt(ins.property_designation)},`, valueX, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Adress:", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${fmt(ins.building_address)}${ins.building_city ? `, ${fmt(ins.building_city)}` : ""}`,
    valueX,
    y
  );
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Byggnad:", labelX, y);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(ins.internal_building_name), valueX, y);
  y += 8;

  // System table (single row from inspection)
  autoTable(doc, {
    startY: y,
    head: [["Systemnr", "Betjänar", "*Resultat", "Besiktning", "Ombesiktn\nsenast", "Nästa\nbesiktning"]],
    body: [[
      fmt(ins.system_number),
      fmt(ins.serves),
      fmt(ins.inspection_result),
      fmt(ins.inspection_date),
      fmt(ins.reinspection_deadline),
      fmt(ins.next_inspection_date),
    ]],
    theme: "plain",
    margin: { left: fx + 6, right: PAGE_W - fx - fw + 6 },
    tableWidth: fw - 12,
    headStyles: { fontSize: 9, textColor: TEXT as any, fontStyle: "normal", halign: "left" },
    bodyStyles: { fontSize: 10, fontStyle: "bold", halign: "left", cellPadding: 1.5 },
    didDrawCell: (data) => {
      // Add bottom dotted line under body row
      if (data.section === "body" && data.column.index === 0 && data.row.index === 0) {
        const tw = (doc as any).lastAutoTable?.settings?.tableWidth ?? fw - 12;
        const ly = data.cell.y + data.cell.height + 1;
        doc.setLineDashPattern([0.5, 0.7], 0);
        doc.setDrawColor(150);
        doc.setLineWidth(0.2);
        doc.line(fx + 6, ly, fx + 6 + tw, ly);
        doc.setLineDashPattern([], 0);
      }
    },
  });
  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 18;

  // Inspector block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lx = fx + 8;
  const vx = fx + 40;
  doc.text("Kontrollant:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(ins.inspector_name), vx, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Behörighet:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${fmt(ins.inspector_certification)}${ins.inspector_certificate_number ? `, ${fmt(ins.inspector_certificate_number)}` : ""}${ins.inspector_certificate_org ? `, ${fmt(ins.inspector_certificate_org)}` : ""}`,
    vx,
    y
  );
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Företag:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(ins.inspector_company), vx, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Adress:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(ins.inspector_address), vx, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Ort:", lx, y);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${fmt(ins.inspector_postal_code)} ${fmt(ins.inspector_city)}`.trim(),
    vx,
    y
  );
  y += 8;

  // Note lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  doc.text("Protokoll finns hos byggnadsägare och byggnadsnämnd", lx, y);
  y += 5;
  doc.text("*Resultat: EG = Ej Godkänt, G = Godkänt", lx, y);
  y += 12;

  // Logo bottom-left + signature line bottom-right
  drawLogo(doc, logo, lx, y, 38);

  const sigX = fx + 70;
  const sigY = y + 6;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(sigX, sigY, fx + fw - 8, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Underskrift", sigX, sigY + 4);

  // Bottom legal note
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const legal = "Enligt SFS 2011:338 kap 5, 6 § skall byggnadens ägare anslå intyget på väl synlig plats i byggnaden.";
  const split = doc.splitTextToSize(legal, fw - 80);
  doc.text(split, sigX, sigY + 10);

  return doc;
};
