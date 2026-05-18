import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const AuthPage = lazy(() => import("@/pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ClientsPage = lazy(() => import("@/pages/ClientsPage").then((module) => ({ default: module.ClientsPage })));
const ClientDetailPage = lazy(() => import("@/pages/ClientDetailPage").then((module) => ({ default: module.ClientDetailPage })));
const DevicesPage = lazy(() => import("@/pages/DevicesPage").then((module) => ({ default: module.DevicesPage })));
const RepairsPage = lazy(() => import("@/pages/RepairsPage").then((module) => ({ default: module.RepairsPage })));
const ReportsPage = lazy(() => import("@/pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const ClientRegistrationPage = lazy(() => import("@/pages/ClientRegistrationPage").then((module) => ({ default: module.ClientRegistrationPage })));

function PageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="surface p-6 text-sm text-slate-500 dark:text-slate-400">Cargando vista...</div>}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PageLoader><AuthPage /></PageLoader>,
  },
  {
    path: "/invitacion/:token",
    element: <PageLoader><ClientRegistrationPage /></PageLoader>,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PageLoader><DashboardPage /></PageLoader> },
      { path: "clientes", element: <PageLoader><ClientsPage /></PageLoader> },
      { path: "clientes/:id", element: <PageLoader><ClientDetailPage /></PageLoader> },
      { path: "equipos", element: <PageLoader><DevicesPage /></PageLoader> },
      { path: "reparaciones", element: <PageLoader><RepairsPage /></PageLoader> },
      { path: "reportes", element: <PageLoader><ReportsPage /></PageLoader> },
      { path: "configuracion", element: <PageLoader><SettingsPage /></PageLoader> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
