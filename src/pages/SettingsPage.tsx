import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useWorkshop";
import type { WorkshopSettings } from "@/types/database";

export function SettingsPage() {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const { register, handleSubmit, reset } = useForm<Partial<WorkshopSettings>>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  return (
    <form
      className="surface grid gap-4 p-5 sm:grid-cols-2"
      onSubmit={handleSubmit((values) => update.mutate(values, { onSuccess: () => toast.success("Configuración guardada."), onError: () => toast.error("No se pudo guardar.") }))}
    >
      <label className="space-y-1">
        <span className="label">Nombre del taller</span>
        <input className="input" {...register("workshop_name")} />
      </label>
      <label className="space-y-1">
        <span className="label">Razón social</span>
        <input className="input" {...register("legal_name")} />
      </label>
      <label className="space-y-1">
        <span className="label">Teléfono</span>
        <input className="input" {...register("phone")} />
      </label>
      <label className="space-y-1">
        <span className="label">Correo</span>
        <input className="input" type="email" {...register("email")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Dirección</span>
        <input className="input" {...register("address")} />
      </label>
      <label className="space-y-1">
        <span className="label">Moneda</span>
        <select className="input" {...register("currency")}>
          <option value="CRC">CRC - Colón costarricense</option>
          <option value="USD">USD - Dólar estadounidense</option>
          <option value="EUR">EUR - Euro</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="label">Impuesto</span>
        <input className="input" type="number" step="0.01" min="0" {...register("tax_rate", { valueAsNumber: true })} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Pie de impresión</span>
        <textarea className="input min-h-24" {...register("print_footer")} />
      </label>
      <div className="flex justify-end sm:col-span-2">
        <button className="btn-primary" disabled={update.isPending}><Save size={18} /> {update.isPending ? "Guardando..." : "Guardar configuración"}</button>
      </div>
    </form>
  );
}
