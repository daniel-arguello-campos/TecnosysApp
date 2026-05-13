import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client } from "@/types/database";

const schema = z.object({
  full_name: z.string().min(3, "Ingresa el nombre completo"),
  document_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ClientForm({ client, onSubmit, onCancel, isSaving }: { client?: Client | null; onSubmit: (values: FormValues) => void; onCancel: () => void; isSaving?: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: client?.full_name ?? "",
      document_id: client?.document_id ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
      notes: client?.notes ?? "",
    },
  });

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Nombre completo</span>
        <input className="input" {...register("full_name")} />
        {errors.full_name ? <span className="text-xs text-rose-600">{errors.full_name.message}</span> : null}
      </label>
      <label className="space-y-1">
        <span className="label">Cédula</span>
        <input className="input" {...register("document_id")} />
      </label>
      <label className="space-y-1">
        <span className="label">Teléfono</span>
        <input className="input" {...register("phone")} />
      </label>
      <label className="space-y-1">
        <span className="label">Correo electrónico</span>
        <input className="input" type="email" {...register("email")} />
        {errors.email ? <span className="text-xs text-rose-600">{errors.email.message}</span> : null}
      </label>
      <label className="space-y-1">
        <span className="label">Dirección</span>
        <input className="input" {...register("address")} />
      </label>
      <label className="space-y-1 sm:col-span-2">
        <span className="label">Notas</span>
        <textarea className="input min-h-24" {...register("notes")} />
      </label>
      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cliente"}</button>
      </div>
    </form>
  );
}
