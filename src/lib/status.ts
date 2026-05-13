import type { DeviceStatus, RepairStatus } from "@/types/database";

export const deviceStatusStyles: Record<DeviceStatus, string> = {
  Recibido: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
  Diagnosticando: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  "Esperando repuesto": "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200",
  "En reparación": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
  Reparado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  Entregado: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  Cancelado: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
};

export const repairStatusStyles: Record<RepairStatus, string> = {
  Pendiente: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
  Diagnosticando: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  "En reparación": "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200",
  Terminada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  Entregada: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  Cancelada: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
};
