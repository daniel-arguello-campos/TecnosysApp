import { useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Wrench, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useAuth";

export function AuthPage() {
  const { session, isLoading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && session) return <Navigate to="/" replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        toast.success("Te enviamos instrucciones para recuperar tu contraseña.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Sesión iniciada correctamente.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600"><Wrench size={22} /></div>
          <div>
            <p className="text-lg font-bold">TallerPro</p>
            <p className="text-sm text-slate-400">Administración de soporte técnico</p>
          </div>
        </div>
        <div className="max-w-2xl py-16">
          <p className="mb-4 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100">Dashboard profesional para talleres</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Control completo de reparaciones, clientes y pagos.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            Gestiona órdenes, equipos, diagnósticos, técnicos, garantías, comprobantes e ingresos desde una interfaz segura conectada a Supabase.
          </p>
        </div>
        <p className="text-sm text-slate-500">Autenticación protegida con Supabase Auth y políticas RLS.</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-900 dark:text-slate-50">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-2xl font-bold">{resetMode ? "Recuperar contraseña" : "Iniciar sesión"}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {resetMode ? "Ingresa tu correo para recibir el enlace de recuperación." : "Accede con tu usuario autorizado del taller."}
          </p>
          <label className="mt-6 block space-y-1">
            <span className="label">Correo electrónico</span>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input className="input pl-10" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </label>
          {!resetMode ? (
            <label className="mt-4 block space-y-1">
              <span className="label">Contraseña</span>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input className="input pl-10" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </label>
          ) : null}
          <button className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Procesando..." : resetMode ? "Enviar recuperación" : "Entrar al sistema"}
            <ArrowRight size={18} />
          </button>
          <button type="button" className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-100" onClick={() => setResetMode((value) => !value)}>
            {resetMode ? "Volver al inicio de sesión" : "Olvidé mi contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
}
