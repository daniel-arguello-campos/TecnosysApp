import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import type { Invoice, Repair } from "@/types/database";

async function saveWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}

export async function exportRepairsToExcel(repairs: Repair[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reparaciones");
  sheet.columns = [
    { header: "Orden", key: "order", width: 18 },
    { header: "Cliente", key: "client", width: 28 },
    { header: "Equipo", key: "device", width: 28 },
    { header: "Técnico", key: "technician", width: 24 },
    { header: "Estado", key: "status", width: 18 },
    { header: "Total", key: "total", width: 14 },
    { header: "Inicio", key: "started", width: 18 },
    { header: "Entrega", key: "delivered", width: 18 },
  ];
  repairs.forEach((repair) => {
    sheet.addRow({
      order: repair.devices?.order_number,
      client: repair.devices?.clients?.full_name,
      device: `${repair.devices?.brand ?? ""} ${repair.devices?.model ?? ""}`.trim(),
      technician: repair.profiles?.full_name,
      status: repair.status,
      total: repair.total,
      started: repair.started_at,
      delivered: repair.delivered_at,
    });
  });
  sheet.getRow(1).font = { bold: true };
  await saveWorkbook(workbook, "reporte-reparaciones.xlsx");
}

export async function exportInvoicesToExcel(invoices: Invoice[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Ingresos");
  sheet.columns = [
    { header: "Factura", key: "invoice_number", width: 20 },
    { header: "Subtotal", key: "subtotal", width: 14 },
    { header: "Impuesto", key: "tax", width: 14 },
    { header: "Total", key: "total", width: 14 },
    { header: "Pagado", key: "paid_amount", width: 14 },
    { header: "Estado", key: "payment_status", width: 16 },
    { header: "Emisión", key: "issued_at", width: 18 },
  ];
  invoices.forEach((invoice) => sheet.addRow(invoice));
  sheet.getRow(1).font = { bold: true };
  await saveWorkbook(workbook, "reporte-ingresos.xlsx");
}
