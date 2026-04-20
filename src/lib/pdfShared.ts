import jsPDF from "jspdf";
import logoUrl from "@/assets/bravida-logo.jpg";

// Brand colors (approximate from logo)
export const BRAVIDA_BLUE: [number, number, number] = [0, 70, 110];
export const BRAVIDA_GREEN: [number, number, number] = [80, 200, 170];
export const BORDER: [number, number, number] = [0, 0, 0];
export const TEXT: [number, number, number] = [0, 0, 0];
export const MUTED: [number, number, number] = [90, 90, 90];

export const fmt = (v: any) =>
  v === null || v === undefined || v === "" ? "" : String(v);

let _logoData: string | null = null;
export const loadLogo = async (): Promise<string | null> => {
  if (_logoData) return _logoData;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    return await new Promise((resolve) => {
      reader.onloadend = () => {
        _logoData = reader.result as string;
        resolve(_logoData);
      };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const drawLogo = (doc: jsPDF, logo: string | null, x: number, y: number, w = 38) => {
  if (!logo) return;
  try {
    // height auto from aspect
    doc.addImage(logo, "JPEG", x, y, w, w * 0.27);
  } catch {
    // ignore
  }
};

/**
 * Draw a labeled cell: thin border, small grey label top-left, value below.
 * Returns nothing; coordinates are in mm.
 */
export const labeledCell = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: any,
  opts: { bold?: boolean; align?: "left" | "center" } = {}
) => {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);

  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...MUTED);
  doc.text(label, x + 1.2, y + 2.6);

  // Value
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(9);
  const v = fmt(value);
  if (v) {
    const align = opts.align ?? "left";
    const tx = align === "center" ? x + w / 2 : x + 2;
    const split = doc.splitTextToSize(v, w - 3);
    doc.text(split, tx, y + 6.5, { align });
  }
};

/** Section title bar (bold left-aligned, no fill) */
export const sectionTitle = (doc: jsPDF, x: number, y: number, text: string) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text(text, x, y);
};
