import { useForm } from "react-hook-form";
import type { Client, Device, DeviceStatus, DeviceType } from "@/types/database";

const deviceTypes: DeviceType[] = ["Laptop", "PC de escritorio", "Impresora", "Consola", "Celular", "Tablet", "Otro"];
const deviceStatuses: DeviceStatus[] = ["Recibido", "Diagnosticando", "Esperando repuesto", "En reparación", "Reparado", "Entregado", "Cancelado"];

type FormValues = Pick<Device, "client_id" | "type" | "brand" | "model" | "serial_number" | "received_accessories" | "physical_condition" | "device_password" | "observations" | "status">;

export function DeviceForm({ device, clients, onSubmit, onCancel, isSaving }: { device?: Device | null; clients: Client[]; onSubmit: (values: FormValues) => void; onCancel: () => void; isSaving?: boolean }) {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      client_id: device?.client_id ?? clients[0]?.id ?? "",
      type: device?.type ?? "Laptop",
      brand: device?.brand ?? "",
      model: device?.model ?? "",
      serial_number: device?.serial_number ?? "",
      received_accessories: device?.received_accessories ?? "",
      physical_condition: device?.physical_condition ?? "",
      device_password: device?.device_password ?? "",
      observations: device?.observations ?? "",
      status: device?.status ?? "Recibido",
    },
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Cliente asociado</span>
        <select className="input" {...register("client_id", { required: true })}>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="label">Tipo de equipo</span>
        <select className="input" {...register("type")}>{deviceTypes.map((type) => <option key={type}>{type}</option>)}</select>
      </label>
      <label className="space-y-1">
        <span className="label">Estado</span>
        <select className="input" {...register("status")}>{deviceStatuses.map((status) => <option key={status}>{status}</option>)}</select>
      </label>
      <label className="space-y-1">
        <span className="label">Marca</span>
        <input className="input" {...register("brand", { required: true })} />
      </label>
      <label className="space-y-1">
        <span className="label">Modelo</span>
        <input className="input" {...register("model")} />
      </label>
      <label className="space-y-1">
        <span className="label">Número de serie</span>
        <input className="input" {...register("serial_number")} />
      </label>
      <label className="space-y-1">
        <span className="label">Contraseña del equipo</span>
        <input className="input" {...register("device_password")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Accesorios recibidos</span>
        <textarea className="input min-h-20" {...register("received_accessories")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Estado físico</span>
        <textarea className="input min-h-20" {...register("physical_condition")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Observaciones</span>
        <textarea className="input min-h-20" {...register("observations")} />
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar equipo"}</button>
      </div>
    </form>
  );
}
