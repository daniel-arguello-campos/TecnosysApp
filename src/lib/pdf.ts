import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Repair, WorkshopSettings } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";

export function generateWorkOrderPdf(repair: Repair, settings?: WorkshopSettings | null) {
  const doc = new jsPDF();
  const workshop = settings?.workshop_name ?? "TallerPro";
  const client = repair.devices?.clients;

  doc.setFontSize(18);
  doc.text(workshop, 14, 18);
  doc.setFontSize(11);
  doc.text("Orden de trabajo", 14, 27);
  doc.text(`Orden: ${repair.devices?.order_number ?? "Sin orden"}`, 150, 18);
  doc.text(`Fecha: ${formatDate(repair.started_at)}`, 150, 27);

  autoTable(doc, {
    startY: 38,
    head: [["Campo", "Detalle"]],
    body: [
      ["Cliente", client?.full_name ?? "Sin cliente"],
      ["Teléfono", client?.phone ?? "No registrado"],
      ["Equipo", `${repair.devices?.brand ?? ""} ${repair.devices?.model ?? ""}`.trim()],
      ["Serie", repair.devices?.serial_number ?? "No registrada"],
      ["Diagnóstico", repair.diagnosis ?? "Pendiente"],
      ["Solución", repair.solution ?? "Pendiente"],
      ["Estado", repair.status],
      ["Garantía", `${repair.warranty_days} días`],
    ],
  });

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
    head: [["Concepto", "Monto"]],
    body: [
      ["Repuestos", formatCurrency(repair.parts_cost, settings?.currency)],
      ["Mano de obra", formatCurrency(repair.labor_cost, settings?.currency)],
      ["Total", formatCurrency(repair.total, settings?.currency)],
    ],
  });

  doc.text("Firma del cliente:", 14, 270);
  doc.line(52, 270, 130, 270);
  doc.save(`orden-${repair.devices?.order_number ?? repair.id}.pdf`);
}

export function generateReceiptPdf(repair: Repair, settings?: WorkshopSettings | null) {
  const doc = new jsPDF({ format: "a4" });
  doc.setFontSize(18);
  doc.text(settings?.workshop_name ?? "TallerPro", 14, 18);
  doc.setFontSize(11);
  doc.text("Comprobante de reparación", 14, 27);

  autoTable(doc, {
    startY: 38,
    head: [["Descripción", "Importe"]],
    body: [
      [`Repuestos: ${repair.parts_used ?? "Sin repuestos"}`, formatCurrency(repair.parts_cost, settings?.currency)],
      ["Mano de obra", formatCurrency(repair.labor_cost, settings?.currency)],
      ["Total", formatCurrency(repair.total, settings?.currency)],
    ],
  });

  doc.save(`comprobante-${repair.devices?.order_number ?? repair.id}.pdf`);
}
