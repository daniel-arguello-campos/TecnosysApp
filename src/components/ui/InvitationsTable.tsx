import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link2, Copy, Ban, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "./DataTable";
import { useInvitations, useCancelInvitation } from "@/hooks/useWorkshop";
import { formatDate } from "@/lib/utils";
import type { ClientInvitation } from "@/types/database";

export function InvitationsTable() {
  const [search, setSearch] = useState("");
  const { data: invitations = [], isLoading } = useInvitations();
  const cancelInvitation = useCancelInvitation();

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/invitacion/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles");
  };

  const handleCancel = (id: string) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta invitación?")) {
      cancelInvitation.mutate(id, {
        onSuccess: () => toast.success("Invitación cancelada exitosamente"),
        onError: () => toast.error("Error al cancelar la invitación"),
      });
    }
  };

  const columns = useMemo<ColumnDef<ClientInvitation>[]>(() => [
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'pending') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={12}/> Pendiente</span>;
        if (s === 'used') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={12}/> Usada</span>;
        if (s === 'expired') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"><AlertCircle size={12}/> Expirada</span>;
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"><XCircle size={12}/> Cancelada</span>;
      }
    },
    { header: "Creación", accessorKey: "created_at", cell: ({ row }) => formatDate(row.original.created_at) },
    { header: "Expiración", accessorKey: "expires_at", cell: ({ row }) => formatDate(row.original.expires_at) },
    { header: "Uso", accessorKey: "used_at", cell: ({ row }) => row.original.used_at ? formatDate(row.original.used_at) : "-" },
    { header: "Cliente", accessorKey: "clients", cell: ({ row }) => row.original.clients?.full_name || "-" },
    { header: "Email", accessorKey: "clients.email", cell: ({ row }) => row.original.clients?.email || "-" },
    { header: "Creado por", accessorKey: "profiles.full_name", cell: ({ row }) => row.original.profiles?.full_name || "-" },
    { header: "Token (Parcial)", accessorKey: "token", cell: ({ row }) => <span className="font-mono text-xs text-slate-500">{row.original.token.substring(0, 8)}...</span> },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const isPending = row.original.status === 'pending';
        return (
          <div className="flex gap-2">
            <button
              title="Copiar Enlace"
              className="btn-secondary h-8 w-8 p-0"
              onClick={() => handleCopyLink(row.original.token)}
            >
              <Copy size={14} />
            </button>
            {isPending && (
              <button
                title="Cancelar Invitación"
                className="btn-secondary h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                onClick={() => handleCancel(row.original.id)}
              >
                <Ban size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ], [cancelInvitation]);

  const filteredData = useMemo(() => {
    if (!search) return invitations;
    const lowerSearch = search.toLowerCase();
    return invitations.filter(inv => 
      inv.clients?.full_name?.toLowerCase().includes(lowerSearch) ||
      inv.clients?.email?.toLowerCase().includes(lowerSearch) ||
      inv.token.toLowerCase().includes(lowerSearch) ||
      inv.profiles?.full_name?.toLowerCase().includes(lowerSearch)
    );
  }, [invitations, search]);

  return (
    <div className="space-y-4">
      <DataTable
        data={filteredData}
        columns={columns}
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por cliente, email, token o creador..."
      />
      {isLoading && <p className="text-sm text-slate-500">Cargando invitaciones...</p>}
    </div>
  );
}
