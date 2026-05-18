import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido"),
  documentId: z.string().min(1, "La cédula/documento es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("El correo no es válido").min(1, "El correo es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
});

type FormValues = z.infer<typeof schema>;

export function ClientRegistrationPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function checkToken() {
      if (!token) return;
      setLoading(true);
      const { data, error: rpcError } = await supabase.rpc("get_invitation_by_token", { p_token: token });
      
      if (rpcError) {
        setError("Error validando la invitación.");
      } else if (data && data.error) {
        setError(data.error);
      }
      setLoading(false);
    }
    checkToken();
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    setIsSubmitting(true);
    const { data, error: rpcError } = await supabase.rpc("register_client_with_invitation", {
      p_token: token,
      p_full_name: values.fullName,
      p_document_id: values.documentId,
      p_phone: values.phone,
      p_email: values.email,
      p_address: values.address,
    });

    if (rpcError) {
      toast.error("Ocurrió un error en el servidor.");
    } else if (data && data.error) {
      toast.error(data.error);
      setError(data.error);
    } else {
      toast.success("Registro completado con éxito");
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full surface p-8 text-center space-y-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
          <CheckCircle className="mx-auto text-green-500" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">¡Registro Exitoso!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Tus datos han sido registrados correctamente. Ya puedes cerrar esta ventana.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full surface p-8 text-center space-y-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
          <AlertCircle className="mx-auto text-rose-500" size={48} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Invitación Inválida</h2>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="w-full max-w-lg surface rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-primary-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Auto Registro de Cliente</h1>
          <p className="text-primary-100 mt-2 text-sm">Por favor, completa tus datos para registrarte en el sistema.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo *</label>
              <input
                type="text"
                className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="Ej. Juan Pérez"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Identificación *</label>
              <input
                type="text"
                className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="Cédula o Pasaporte"
                {...register("documentId")}
              />
              {errors.documentId && <p className="text-xs text-rose-500">{errors.documentId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono *</label>
              <input
                type="tel"
                className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="Tu número telefónico"
                {...register("phone")}
              />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico *</label>
              <input
                type="email"
                className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                placeholder="tu@email.com"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dirección Física *</label>
              <textarea
                rows={2}
                className="input-field w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 resize-none"
                placeholder="Tu dirección exacta"
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-rose-500">{errors.address.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3 text-base font-semibold transition-all hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Registrando...
              </span>
            ) : (
              "Completar Registro"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
