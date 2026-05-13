import { useForm } from "react-hook-form";
import type { Device, Repair, RepairStatus } from "@/types/database";
import type { Profile } from "@/types/database";

const statuses: RepairStatus[] = ["Pendiente", "Diagnosticando", "En reparación", "Terminada", "Entregada", "Cancelada"];

type FormValues = Pick<Repair, "device_id" | "technician_id" | "diagnosis" | "solution" | "parts_used" | "parts_cost" | "labor_cost" | "status" | "estimated_delivery_at" | "delivered_at" | "warranty_days" | "internal_comments">;

export function RepairForm({ repair, devices, technicians, onSubmit, onCancel, isSaving }: { repair?: Repair | null; devices: Device[]; technicians: Profile[]; onSubmit: (values: FormValues) => void; onCancel: () => void; isSaving?: boolean }) {
  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      device_id: repair?.device_id ?? devices[0]?.id ?? "",
      technician_id: repair?.technician_id ?? technicians[0]?.id ?? null,
      diagnosis: repair?.diagnosis ?? "",
      solution: repair?.solution ?? "",
      parts_used: repair?.parts_used ?? "",
      parts_cost: repair?.parts_cost ?? 0,
      labor_cost: repair?.labor_cost ?? 0,
      status: repair?.status ?? "Pendiente",
      estimated_delivery_at: repair?.estimated_delivery_at ?? "",
      delivered_at: repair?.delivered_at ?? "",
      warranty_days: repair?.warranty_days ?? 30,
      internal_comments: repair?.internal_comments ?? "",
    },
  });
  const total = Number(watch("parts_cost") ?? 0) + Number(watch("labor_cost") ?? 0);

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="space-y-1">
        <span className="label">Equipo</span>
        <select className="input" {...register("device_id", { required: true })}>
          {devices.map((device) => <option key={device.id} value={device.id}>{device.order_number} - {device.brand} {device.model}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="label">Técnico asignado</span>
        <select className="input" {...register("technician_id")}>
          <option value="">Sin asignar</option>
          {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.full_name}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="label">Estado del servicio</span>
        <select className="input" {...register("status")}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
      </label>
      <label className="space-y-1">
        <span className="label">Garantía en días</span>
        <input className="input" type="number" min="0" {...register("warranty_days", { valueAsNumber: true })} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Diagnóstico</span>
        <textarea className="input min-h-20" {...register("diagnosis")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Solución aplicada</span>
        <textarea className="input min-h-20" {...register("solution")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Repuestos usados</span>
        <textarea className="input min-h-20" {...register("parts_used")} />
      </label>
      <label className="space-y-1">
        <span className="label">Costo de repuestos</span>
        <input className="input" type="number" step="0.01" min="0" {...register("parts_cost", { valueAsNumber: true })} />
      </label>
      <label className="space-y-1">
        <span className="label">Mano de obra</span>
        <input className="input" type="number" step="0.01" min="0" {...register("labor_cost", { valueAsNumber: true })} />
      </label>
      <label className="space-y-1">
        <span className="label">Entrega estimada</span>
        <input className="input" type="date" {...register("estimated_delivery_at")} />
      </label>
      <label className="space-y-1">
        <span className="label">Entrega real</span>
        <input className="input" type="date" {...register("delivered_at")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Comentarios internos</span>
        <textarea className="input min-h-20" {...register("internal_comments")} />
      </label>
      <div className="rounded-lg bg-slate-100 p-4 text-sm font-semibold dark:bg-slate-900">Total calculado: {total.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</div>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar reparación"}</button>
      </div>
    </form>
  );
}
