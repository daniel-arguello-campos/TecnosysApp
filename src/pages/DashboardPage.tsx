import { CheckCircle2, Clock3, Computer, DollarSign, Wrench } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useClients, useDashboardStats, useMonthlyIncome, useRepairs } from "@/hooks/useWorkshop";
import { formatCurrency, formatDate } from "@/lib/utils";
import { repairStatusStyles } from "@/lib/status";

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: income = [] } = useMonthlyIncome();
  const { data: clients = [] } = useClients();
  const { data: repairs = [] } = useRepairs();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Equipos en reparación" value={String(stats?.devices_in_repair ?? 0)} hint={isLoading ? "Cargando..." : "Activos en taller"} icon={Computer} />
        <StatCard title="Equipos entregados" value={String(stats?.devices_delivered ?? 0)} hint="Histórico entregado" icon={CheckCircle2} />
        <StatCard title="Pendientes" value={String(stats?.repairs_pending ?? 0)} hint="Servicios por avanzar" icon={Clock3} />
        <StatCard title="Terminadas" value={String(stats?.repairs_finished ?? 0)} hint="Listas o entregadas" icon={Wrench} />
        <StatCard title="Ingresos del mes" value={formatCurrency(stats?.monthly_income)} hint="Pagos registrados" icon={DollarSign} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Ingresos mensuales</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">Últimos 6 meses</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={income}>
                <defs>
                  <linearGradient id="income" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="income" stroke="#06b6d4" fill="url(#income)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface p-4">
          <h2 className="font-bold">Servicios recientes</h2>
          <div className="mt-4 space-y-3">
            {repairs.slice(0, 6).map((repair) => (
              <div key={repair.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{repair.devices?.order_number} · {repair.devices?.clients?.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(repair.started_at)}</p>
                </div>
                <Badge className={repairStatusStyles[repair.status]}>{repair.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface p-4">
        <h2 className="font-bold">Últimos clientes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clients.slice(0, 8).map((client) => (
            <div key={client.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="font-semibold">{client.full_name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{client.phone ?? "Sin teléfono"}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Registro: {formatDate(client.created_at)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
