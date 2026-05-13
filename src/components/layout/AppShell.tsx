import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  ChartNoAxesCombined,
  ClipboardList,
  Computer,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn, getInitials } from "@/lib/utils";
import { useProfile, useSession } from "@/hooks/useAuth";
import { useUiStore } from "@/stores/uiStore";
import { useNotifications } from "@/hooks/useWorkshop";

const navItems = [
  { label: "Panel", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Equipos", href: "/equipos", icon: Computer },
  { label: "Reparaciones", href: "/reparaciones", icon: Wrench },
  { label: "Reportes", href: "/reportes", icon: ChartNoAxesCombined },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

const titles: Record<string, string> = {
  "/": "Panel principal",
  "/clientes": "Clientes",
  "/equipos": "Equipos",
  "/reparaciones": "Servicios y reparaciones",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
};

export function AppShell() {
  const location = useLocation();
  const { user } = useSession();
  const { data: profile } = useProfile(user);
  const { data: notifications = [] } = useNotifications();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme, hydrateTheme } = useUiStore();

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  const title = titles[location.pathname] ?? "TallerPro";
  const unread = notifications.filter((item) => !item.read_at).length;

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <ClipboardList size={21} />
            </div>
            <div>
              <p className="text-base font-bold">TallerPro</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestión técnica</p>
            </div>
          </div>
          <button className="btn-secondary h-9 w-9 p-0 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">
              {getInitials(profile?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? user?.email}</p>
              <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{profile?.role === "admin" ? "Administrador" : "Técnico"}</p>
            </div>
          </div>
          <button className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900" onClick={signOut}>
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen ? <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <button className="btn-secondary h-10 w-10 p-0 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <Menu size={19} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
          </div>
          <div className="hidden min-w-72 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Search size={17} className="mr-2" />
            Buscar orden, cliente o serie
          </div>
          <button className="btn-secondary relative h-10 w-10 p-0" aria-label="Notificaciones">
            <Bell size={18} />
            {unread > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">{unread}</span> : null}
          </button>
          <button className="btn-secondary h-10 w-10 p-0" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
