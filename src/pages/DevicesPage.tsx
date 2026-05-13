import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import { ImageUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { DeviceForm } from "@/components/forms/DeviceForm";
import { useProfile, useSession } from "@/hooks/useAuth";
import { uploadDevicePhoto, useClients, useDeleteDevice, useDevices, useUpsertDevice } from "@/hooks/useWorkshop";
import { deviceStatusStyles } from "@/lib/status";
import type { Device } from "@/types/database";

export function DevicesPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Device | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Device | null>(null);
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data = [] } = useDevices(search);
  const { data: clients = [] } = useClients();
  const upsert = useUpsertDevice();
  const remove = useDeleteDevice();
  const isAdmin = profile?.role === "admin";

  async function handlePhoto(device: Device, files: FileList | null) {
    if (!files?.[0]) return;
    try {
      await uploadDevicePhoto(device.id, files[0]);
      toast.success("Imagen subida correctamente.");
    } catch {
      toast.error("No se pudo subir la imagen.");
    }
  }

  const columns = useMemo<ColumnDef<Device>[]>(() => [
    { header: "Orden", accessorKey: "order_number", cell: ({ row }) => <span className="font-semibold">{row.original.order_number}</span> },
    { header: "Cliente", cell: ({ row }) => row.original.clients?.full_name ?? "Sin cliente" },
    { header: "Equipo", cell: ({ row }) => `${row.original.type} · ${row.original.brand} ${row.original.model ?? ""}` },
    { header: "Serie", accessorKey: "serial_number" },
    { header: "Estado", cell: ({ row }) => <Badge className={deviceStatusStyles[row.original.status]}>{row.original.status}</Badge> },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <label className="btn-secondary h-9 w-9 cursor-pointer p-0" aria-label="Subir foto">
            <ImageUp size={16} />
            <input className="hidden" type="file" accept="image/*" onChange={(event) => void handlePhoto(row.original, event.target.files)} />
          </label>
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => { setEditing(row.original); setModalOpen(true); }} aria-label="Editar equipo"><Pencil size={16} /></button>
          {isAdmin ? <button className="btn-secondary h-9 w-9 p-0 text-rose-600" onClick={() => setDeleting(row.original)} aria-label="Eliminar equipo"><Trash2 size={16} /></button> : null}
        </div>
      ),
    },
  ], [isAdmin]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Registro de equipos, series, accesorios, fotos y estados visuales.</p>
        <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Nuevo equipo</button>
      </div>
      <DataTable data={data} columns={columns} search={search} onSearch={setSearch} placeholder="Buscar por orden, serie, marca o modelo" />
      <Modal open={modalOpen} title={editing ? "Editar equipo" : "Nuevo equipo"} onClose={() => setModalOpen(false)}>
        <DeviceForm clients={clients} device={editing} isSaving={upsert.isPending} onCancel={() => setModalOpen(false)} onSubmit={(values) => {
          upsert.mutate({ ...editing, ...values }, { onSuccess: () => { toast.success("Equipo guardado."); setModalOpen(false); }, onError: () => toast.error("No se pudo guardar.") });
        }} />
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Eliminar equipo" description="Solo administradores pueden eliminar equipos. Esta acción no se puede deshacer." onCancel={() => setDeleting(null)} onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Equipo eliminado."); setDeleting(null); }, onError: () => toast.error("No se pudo eliminar.") })} />
    </div>
  );
}
