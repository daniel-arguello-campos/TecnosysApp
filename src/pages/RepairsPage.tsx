import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { FileDown, Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { RepairForm } from "@/components/forms/RepairForm";
import { useProfile, useSession } from "@/hooks/useAuth";
import { useDeleteRepair, useDevices, useRepairs, useSettings, useTechnicians, useUpsertRepair } from "@/hooks/useWorkshop";
import { repairStatusStyles } from "@/lib/status";
import { formatCurrency } from "@/lib/utils";
import type { Repair } from "@/types/database";

export function RepairsPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Repair | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Repair | null>(null);
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data = [] } = useRepairs(search);
  const { data: devices = [] } = useDevices();
  const { data: technicians = [] } = useTechnicians();
  const { data: settings } = useSettings();
  const upsert = useUpsertRepair();
  const remove = useDeleteRepair();
  const isAdmin = profile?.role === "admin";

  async function downloadWorkOrder(repair: Repair) {
    const { generateWorkOrderPdf } = await import("@/lib/pdf");
    generateWorkOrderPdf(repair, settings);
  }

  async function downloadReceipt(repair: Repair) {
    const { generateReceiptPdf } = await import("@/lib/pdf");
    generateReceiptPdf(repair, settings);
  }

  const columns = useMemo<ColumnDef<Repair>[]>(() => [
    { header: "Orden", cell: ({ row }) => <span className="font-semibold">{row.original.devices?.order_number}</span> },
    { header: "Cliente", cell: ({ row }) => row.original.devices?.clients?.full_name ?? "Sin cliente" },
    { header: "Equipo", cell: ({ row }) => `${row.original.devices?.brand ?? ""} ${row.original.devices?.model ?? ""}`.trim() },
    { header: "Técnico", cell: ({ row }) => row.original.profiles?.full_name ?? "Sin asignar" },
    { header: "Estado", cell: ({ row }) => <Badge className={repairStatusStyles[row.original.status]}>{row.original.status}</Badge> },
    { header: "Total", cell: ({ row }) => formatCurrency(row.original.total, settings?.currency) },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => void downloadWorkOrder(row.original)} aria-label="Orden PDF"><FileDown size={16} /></button>
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => void downloadReceipt(row.original)} aria-label="Comprobante PDF"><ReceiptText size={16} /></button>
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => { setEditing(row.original); setModalOpen(true); }} aria-label="Editar reparación"><Pencil size={16} /></button>
          {isAdmin ? <button className="btn-secondary h-9 w-9 p-0 text-rose-600" onClick={() => setDeleting(row.original)} aria-label="Eliminar reparación"><Trash2 size={16} /></button> : null}
        </div>
      ),
    },
  ], [isAdmin, settings]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Diagnósticos, soluciones, costos, garantía, PDFs y control de estados.</p>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Nueva reparación</button>
      </div>
      <DataTable data={data} columns={columns} search={search} onSearch={setSearch} placeholder="Buscar por diagnóstico, solución o repuestos" />
      <Modal open={modalOpen} title={editing ? "Editar reparación" : "Nueva reparación"} onClose={() => setModalOpen(false)}>
        <RepairForm devices={devices} technicians={technicians} repair={editing} isSaving={upsert.isPending} onCancel={() => setModalOpen(false)} onSubmit={(values) => {
          const { total: _generatedTotal, ...editableRepair } = editing ?? {};
          upsert.mutate({ ...editableRepair, ...values }, { onSuccess: () => { toast.success("Reparación guardada."); setModalOpen(false); }, onError: () => toast.error("No se pudo guardar.") });
        }} />
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Eliminar reparación" description="Solo administradores pueden eliminar reparaciones. La auditoría conservará el evento." onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Reparación eliminada."); setDeleting(null); }, onError: () => toast.error("No se pudo eliminar.") })} />
    </div>
  );
}
