import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useClient, useClientHistory } from "@/hooks/useWorkshop";
import { deviceStatusStyles, repairStatusStyles } from "@/lib/status";
import { formatDate } from "@/lib/utils";

export function ClientDetailPage() {
  const { id } = useParams();
  const { data: client } = useClient(id);
  const { data: history = [] } = useClientHistory(id);

  if (!client) return <p className="text-sm text-slate-500">Cargando cliente...</p>;

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-100"><ArrowLeft size={16} /> Volver a clientes</Link>
      <section className="surface p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="label">Cliente</p>
            <h2 className="mt-1 text-2xl font-bold">{client.full_name}</h2>
          </div>
          <div><p className="label">Teléfono</p><p className="mt-1">{client.phone ?? "No registrado"}</p></div>
          <div><p className="label">Correo</p><p className="mt-1">{client.email ?? "No registrado"}</p></div>
          <div><p className="label">Cédula</p><p className="mt-1">{client.document_id ?? "No registrada"}</p></div>
          <div className="md:col-span-2"><p className="label">Dirección</p><p className="mt-1">{client.address ?? "No registrada"}</p></div>
          <div className="md:col-span-3"><p className="label">Notas</p><p className="mt-1">{client.notes ?? "Sin notas"}</p></div>
        </div>
      </section>

      <section className="surface p-5">
        <h3 className="font-bold">Historial de reparaciones</h3>
        <div className="mt-4 space-y-3">
          {history.length === 0 ? <EmptyState title="Sin historial" description="Este cliente todavía no tiene equipos o reparaciones registradas." /> : null}
          {history.map((device) => (
            <div key={device.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{device.order_number} · {device.brand} {device.model}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Serie: {device.serial_number ?? "No registrada"} · Ingreso: {formatDate(device.entry_date)}</p>
                </div>
                <Badge className={deviceStatusStyles[device.status]}>{device.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {device.repairs?.map((repair) => (
                  <div key={repair.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                    <Badge className={repairStatusStyles[repair.status]}>{repair.status}</Badge>
                    <p className="mt-2">{repair.diagnosis ?? "Diagnóstico pendiente"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
