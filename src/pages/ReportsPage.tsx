import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { useInvoices, useRepairs } from "@/hooks/useWorkshop";
import { formatCurrency } from "@/lib/utils";

export function ReportsPage() {
  const { data: repairs = [] } = useRepairs();
  const { data: invoices = [] } = useInvoices();

  const byStatus = Object.values(repairs.reduce<Record<string, { status: string; total: number }>>((acc, repair) => {
    acc[repair.status] ??= { status: repair.status, total: 0 };
    acc[repair.status].total += 1;
    return acc;
  }, {}));

  const paid = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_amount ?? 0), 0);
  const pending = invoices.reduce((sum, invoice) => sum + Math.max(Number(invoice.total ?? 0) - Number(invoice.paid_amount ?? 0), 0), 0);

  async function downloadRepairs() {
    const { exportRepairsToExcel } = await import("@/lib/export");
    await exportRepairsToExcel(repairs);
  }

  async function downloadInvoices() {
    const { exportInvoicesToExcel } = await import("@/lib/export");
    await exportInvoicesToExcel(invoices);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Reparaciones registradas" value={String(repairs.length)} hint="Total histórico" icon={Download} />
        <StatCard title="Facturas" value={String(invoices.length)} hint="Emitidas" icon={Download} />
        <StatCard title="Cobrado" value={formatCurrency(paid)} hint="Pagos aplicados" icon={Download} />
        <StatCard title="Pendiente de pago" value={formatCurrency(pending)} hint="Saldo por cobrar" icon={Download} />
      </div>

      <section className="surface p-4">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold">Reparaciones por estado</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Resumen operativo para priorizar el taller.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => void downloadRepairs()}><Download size={17} /> Reparaciones Excel</button>
            <button className="btn-secondary" onClick={() => void downloadInvoices()}><Download size={17} /> Ingresos Excel</button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
