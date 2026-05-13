# TallerPro

Aplicación web moderna para administrar un taller de reparación de computadoras y soporte técnico. Incluye clientes, equipos, reparaciones, diagnósticos, estados, pagos, reportes, PDFs, Storage, Auth, roles y auditoría básica.

## Tecnologías

- React + TypeScript + Vite
- TailwindCSS
- Supabase Auth, PostgreSQL, Storage y RLS
- TanStack Query y TanStack Table
- Zustand
- jsPDF y XLSX
- Recharts

## Requisitos

- Node.js 22 o superior
- Una cuenta y proyecto en Supabase
- npm

## Instalación Local

```bash
npm install
cp .env.example .env
npm run dev
```

Configura `.env`:

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_APP_NAME=TallerPro
```

## Conectar Supabase

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**.
3. Copia y ejecuta [supabase/schema.sql](./supabase/schema.sql).
4. Ve a **Project Settings > API Keys** y copia la llave publishable.
5. Pega la URL y la llave en `.env`.
6. En **Authentication > Providers**, habilita Email.
7. En **Authentication > URL Configuration**, agrega:
   - Local: `http://localhost:5173`
   - Producción: tu dominio de Vercel.

## Crear Usuarios Y Roles

Supabase Auth crea los usuarios. El trigger `handle_new_user` crea automáticamente el perfil en `profiles`.

Para convertir un usuario en administrador:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID_DEL_USUARIO';
```

Los técnicos pueden crear y editar registros. Solo administradores pueden eliminar registros por UI y por políticas RLS.

## Funcionalidades

- Inicio de sesión seguro con Supabase Auth.
- Recuperación de contraseña.
- Rutas protegidas y sesión persistente.
- Dashboard con métricas, clientes recientes, servicios recientes y gráfico de ingresos.
- CRUD de clientes con búsqueda, filtros, historial y detalle.
- Registro de equipos con estados, serie, contraseña, accesorios, observaciones y fotos en Supabase Storage.
- Reparaciones con técnico, diagnóstico, solución, repuestos, costos, garantía, PDF de orden y comprobante.
- Reportes con gráficos y exportación a Excel.
- Configuración del taller: datos, moneda, impuesto y pie de impresión.
- RLS, auditoría básica, historial de cambios de estado y números automáticos.

## Estructura

```text
src/
  components/
    forms/
    layout/
    ui/
  hooks/
  lib/
  pages/
  stores/
  styles/
  types/
supabase/
  schema.sql
docs/
  database-diagram.md
  deploy-vercel.md
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

## Despliegue En Vercel

Consulta [docs/deploy-vercel.md](./docs/deploy-vercel.md).

## Seguridad

- RLS activado en todas las tablas públicas.
- Las eliminaciones están restringidas a administradores.
- La autorización usa `profiles.role`, no `user_metadata`.
- Storage usa buckets privados para equipos y reparaciones.
- El frontend usa solo la llave publishable o anon pública, nunca service role.
- Los datos se validan en formularios principales y mediante constraints SQL.

## Esquema Visual

Consulta [docs/database-diagram.md](./docs/database-diagram.md).
