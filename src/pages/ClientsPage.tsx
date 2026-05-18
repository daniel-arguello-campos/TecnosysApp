import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, Pencil, Plus, Trash2, Link2, Loader2 } from "lucide-react";
import { ClientForm } from "@/components/forms/ClientForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { InvitationsTable } from "@/components/ui/InvitationsTable";
import { useProfile, useSession } from "@/hooks/useAuth";
import { useClients, useDeleteClient, useUpsertClient, useCreateInvitation } from "@/hooks/useWorkshop";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/types/database";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "invitations">("clients");
  const [editing, setEditing] = useState<Client | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data = [], isLoading } = useClients(search);
  const upsert = useUpsertClient();
  const remove = useDeleteClient();
  const createInvitation = useCreateInvitation();
  const isAdmin = profile?.role === "admin";

  const handleCreateInvitation = () => {
    createInvitation.mutate(undefined, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/invitacion/${data.token}`;
        navigator.clipboard.writeText(link);
        toast.success("Enlace generado y copiado al portapapeles.");
        setActiveTab("invitations");
      },
      onError: () => toast.error("Error al generar la invitación."),
    });
  };

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    { header: "Cliente", accessorKey: "full_name", cell: ({ row }) => <span className="font-semibold">{row.original.full_name}</span> },
    { header: "Cédula", accessorKey: "document_id" },
    { header: "Teléfono", accessorKey: "phone" },
    { header: "Correo", accessorKey: "email" },
    { header: "Registro", accessorKey: "created_at", cell: ({ row }) => formatDate(row.original.created_at) },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link className="btn-secondary h-9 w-9 p-0" to={`/clientes/${row.original.id}`} aria-label="Ver cliente"><Eye size={16} /></Link>
          <button className="btn-secondary h-9 w-9 p-0" onClick={() => { setEditing(row.original); setModalOpen(true); }} aria-label="Editar cliente"><Pencil size={16} /></button>
          {isAdmin ? <button className="btn-secondary h-9 w-9 p-0 text-rose-600" onClick={() => setDeleting(row.original)} aria-label="Eliminar cliente"><Trash2 size={16} /></button> : null}
        </div>
      ),
    },
  ], [isAdmin]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Búsqueda rápida, historial y datos de contacto.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn-secondary" 
            onClick={handleCreateInvitation}
            disabled={createInvitation.isPending}
          >
            {createInvitation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
            Crear enlace de invitación
          </button>
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Nuevo cliente</button>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("clients")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "clients" ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"}`}
          >
            Listado de Clientes
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "invitations" ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"}`}
          >
            Invitaciones
          </button>
        </nav>
      </div>

      {activeTab === "clients" ? (
        <>
          <DataTable data={data} columns={columns} search={search} onSearch={setSearch} placeholder="Buscar por nombre, cédula, teléfono o correo" />
          {isLoading ? <p className="text-sm text-slate-500">Cargando clientes...</p> : null}
        </>
      ) : (
        <InvitationsTable />
      )}
      <Modal open={modalOpen} title={editing ? "Editar cliente" : "Nuevo cliente"} onClose={() => setModalOpen(false)}>
        <ClientForm
          client={editing}
          isSaving={upsert.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={(values) => {
            upsert.mutate({ ...editing, ...values }, {
              onSuccess: () => { toast.success("Cliente guardado."); setModalOpen(false); },
              onError: () => toast.error("No se pudo guardar el cliente."),
            });
          }}
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar cliente"
        description="Esta acción eliminará el registro si no tiene dependencias protegidas. Solo administradores pueden hacerlo."
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Cliente eliminado."); setDeleting(null); }, onError: () => toast.error("No se pudo eliminar.") })}
      />
    </div>
  );
}
