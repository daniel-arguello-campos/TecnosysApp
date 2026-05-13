-- TallerPro - esquema completo para Supabase/PostgreSQL
-- Ejecutar en Supabase SQL Editor. Incluye tablas, relaciones, RLS, Storage, funciones, triggers y seeds.

create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'technician');
create type public.device_type as enum ('Laptop', 'PC de escritorio', 'Impresora', 'Consola', 'Celular', 'Tablet', 'Otro');
create type public.device_status as enum ('Recibido', 'Diagnosticando', 'Esperando repuesto', 'En reparación', 'Reparado', 'Entregado', 'Cancelado');
create type public.repair_status as enum ('Pendiente', 'Diagnosticando', 'En reparación', 'Terminada', 'Entregada', 'Cancelada');
create type public.payment_status as enum ('Pendiente', 'Parcial', 'Pagado', 'Anulado');
create type public.notification_type as enum ('info', 'warning', 'success', 'error');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'technician',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  document_id text,
  phone text,
  email text,
  address text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  order_number text not null unique,
  type public.device_type not null,
  brand text not null,
  model text,
  serial_number text,
  received_accessories text,
  physical_condition text,
  device_password text,
  observations text,
  status public.device_status not null default 'Recibido',
  entry_date timestamptz not null default now(),
  delivered_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.device_photos (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.repairs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete restrict,
  technician_id uuid references public.profiles(id),
  diagnosis text,
  solution text,
  parts_used text,
  parts_cost numeric(12,2) not null default 0 check (parts_cost >= 0),
  labor_cost numeric(12,2) not null default 0 check (labor_cost >= 0),
  total numeric(12,2) generated always as (parts_cost + labor_cost) stored,
  status public.repair_status not null default 'Pendiente',
  started_at timestamptz not null default now(),
  estimated_delivery_at date,
  delivered_at date,
  warranty_days integer not null default 30 check (warranty_days >= 0),
  internal_comments text,
  customer_signature_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.repair_status_history (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs(id) on delete cascade,
  previous_status public.repair_status,
  new_status public.repair_status not null,
  notes text,
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.repair_attachments (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.technicians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  specialty text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs(id) on delete restrict,
  invoice_number text not null unique,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  payment_status public.payment_status not null default 'Pendiente',
  issued_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type public.notification_type not null default 'info',
  user_id uuid references public.profiles(id) on delete cascade,
  read_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  workshop_name text not null default 'TallerPro',
  legal_name text,
  phone text,
  email text,
  address text,
  logo_url text,
  currency text not null default 'CRC',
  tax_rate numeric(5,2) not null default 13,
  print_footer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index clients_search_idx on public.clients using gin (to_tsvector('spanish', coalesce(full_name,'') || ' ' || coalesce(document_id,'') || ' ' || coalesce(phone,'')));
create index devices_client_idx on public.devices(client_id);
create index devices_serial_idx on public.devices(serial_number);
create index devices_order_idx on public.devices(order_number);
create index repairs_device_idx on public.repairs(device_id);
create index repairs_technician_idx on public.repairs(technician_id);
create index invoices_repair_idx on public.invoices(repair_id);
create index notifications_user_idx on public.notifications(user_id, read_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select auth.uid();
$$;

create sequence if not exists public.devices_order_seq start 1;

create or replace function public.make_order_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'OT-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.devices_order_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create sequence if not exists public.invoices_number_seq start 1;

create or replace function public.make_invoice_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'FAC-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.invoices_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_app_meta_data->>'role')::public.user_role, 'technician')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.log_repair_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.repair_status_history (repair_id, previous_status, new_status, changed_by)
    values (new.id, case when tg_op = 'INSERT' then null else old.status end, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create or replace function public.audit_row_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  row_id uuid;
begin
  row_id := coalesce(new.id, old.id);
  insert into public.audit_logs(user_id, action, entity, entity_id, metadata)
  values (auth.uid(), tg_op, tg_table_name, row_id, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
  return coalesce(new, old);
end;
$$;

create or replace function public.get_dashboard_stats()
returns json
language sql
stable
set search_path = ''
as $$
  select json_build_object(
    'devices_in_repair', (select count(*) from public.devices where status in ('Diagnosticando','Esperando repuesto','En reparación')),
    'devices_delivered', (select count(*) from public.devices where status = 'Entregado'),
    'repairs_pending', (select count(*) from public.repairs where status in ('Pendiente','Diagnosticando','En reparación')),
    'repairs_finished', (select count(*) from public.repairs where status in ('Terminada','Entregada')),
    'monthly_income', coalesce((select sum(paid_amount) from public.invoices where issued_at >= date_trunc('month', now())), 0)
  );
$$;

create or replace function public.get_monthly_income()
returns table(month text, income numeric)
language sql
stable
set search_path = ''
as $$
  select to_char(months.month, 'Mon YYYY') as month,
         coalesce(sum(i.paid_amount), 0) as income
  from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') months(month)
  left join public.invoices i on date_trunc('month', i.issued_at) = months.month
  group by months.month
  order by months.month;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger clients_updated_at before update on public.clients for each row execute function public.touch_updated_at();
create trigger devices_updated_at before update on public.devices for each row execute function public.touch_updated_at();
create trigger repairs_updated_at before update on public.repairs for each row execute function public.touch_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.touch_updated_at();
create trigger devices_order_number before insert on public.devices for each row execute function public.make_order_number();
create trigger invoices_number before insert on public.invoices for each row execute function public.make_invoice_number();
create trigger repair_status_history_insert after insert or update of status on public.repairs for each row execute function public.log_repair_status_change();

create trigger audit_clients after insert or update or delete on public.clients for each row execute function public.audit_row_change();
create trigger audit_devices after insert or update or delete on public.devices for each row execute function public.audit_row_change();
create trigger audit_repairs after insert or update or delete on public.repairs for each row execute function public.audit_row_change();
create trigger audit_invoices after insert or update or delete on public.invoices for each row execute function public.audit_row_change();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.devices enable row level security;
alter table public.device_photos enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_status_history enable row level security;
alter table public.repair_attachments enable row level security;
alter table public.technicians enable row level security;
alter table public.invoices enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "Perfiles visibles para usuarios autenticados" on public.profiles for select to authenticated using (true);
create policy "Usuario actual puede actualizar su perfil" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Administradores gestionan perfiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Usuarios autenticados leen clientes" on public.clients for select to authenticated using (true);
create policy "Usuarios autenticados crean clientes" on public.clients for insert to authenticated with check (true);
create policy "Usuarios autenticados actualizan clientes" on public.clients for update to authenticated using (true) with check (true);
create policy "Solo administradores eliminan clientes" on public.clients for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen equipos" on public.devices for select to authenticated using (true);
create policy "Usuarios autenticados crean equipos" on public.devices for insert to authenticated with check (true);
create policy "Usuarios autenticados actualizan equipos" on public.devices for update to authenticated using (true) with check (true);
create policy "Solo administradores eliminan equipos" on public.devices for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen fotos" on public.device_photos for select to authenticated using (true);
create policy "Usuarios autenticados crean fotos" on public.device_photos for insert to authenticated with check (true);
create policy "Solo administradores eliminan fotos" on public.device_photos for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen reparaciones" on public.repairs for select to authenticated using (true);
create policy "Usuarios autenticados crean reparaciones" on public.repairs for insert to authenticated with check (true);
create policy "Usuarios autenticados actualizan reparaciones" on public.repairs for update to authenticated using (true) with check (true);
create policy "Solo administradores eliminan reparaciones" on public.repairs for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen historial" on public.repair_status_history for select to authenticated using (true);
create policy "Sistema crea historial" on public.repair_status_history for insert to authenticated with check (true);

create policy "Usuarios autenticados leen adjuntos" on public.repair_attachments for select to authenticated using (true);
create policy "Usuarios autenticados crean adjuntos" on public.repair_attachments for insert to authenticated with check (true);
create policy "Solo administradores eliminan adjuntos" on public.repair_attachments for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen tecnicos" on public.technicians for select to authenticated using (true);
create policy "Administradores gestionan tecnicos" on public.technicians for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Usuarios autenticados leen facturas" on public.invoices for select to authenticated using (true);
create policy "Usuarios autenticados crean facturas" on public.invoices for insert to authenticated with check (true);
create policy "Usuarios autenticados actualizan facturas" on public.invoices for update to authenticated using (true) with check (true);
create policy "Solo administradores eliminan facturas" on public.invoices for delete to authenticated using (public.is_admin());

create policy "Usuarios leen sus notificaciones y globales" on public.notifications for select to authenticated using (user_id is null or user_id = (select auth.uid()));
create policy "Usuarios actualizan sus notificaciones" on public.notifications for update to authenticated using (user_id is null or user_id = (select auth.uid())) with check (user_id is null or user_id = (select auth.uid()));
create policy "Usuarios autenticados crean notificaciones" on public.notifications for insert to authenticated with check (true);
create policy "Solo administradores eliminan notificaciones" on public.notifications for delete to authenticated using (public.is_admin());

create policy "Usuarios autenticados leen configuracion" on public.settings for select to authenticated using (true);
create policy "Administradores actualizan configuracion" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Administradores leen auditoria" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "Sistema inserta auditoria" on public.audit_logs for insert to authenticated with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('device-media', 'device-media', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf']::text[]),
  ('repair-files', 'repair-files', false, 20971520, array['image/jpeg','image/png','image/webp','application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']::text[]),
  ('workshop-assets', 'workshop-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml']::text[])
on conflict (id) do nothing;

create policy "Usuarios autenticados leen archivos de taller" on storage.objects for select to authenticated using (bucket_id in ('device-media','repair-files','workshop-assets'));
create policy "Usuarios autenticados suben archivos de taller" on storage.objects for insert to authenticated with check (bucket_id in ('device-media','repair-files','workshop-assets'));
create policy "Usuarios autenticados actualizan archivos propios" on storage.objects for update to authenticated using (bucket_id in ('device-media','repair-files','workshop-assets') and owner = (select auth.uid())) with check (bucket_id in ('device-media','repair-files','workshop-assets'));
create policy "Solo administradores eliminan archivos" on storage.objects for delete to authenticated using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.get_dashboard_stats() to authenticated;
grant execute on function public.get_monthly_income() to authenticated;

insert into public.settings (workshop_name, legal_name, phone, email, address, currency, tax_rate, print_footer)
values ('TallerPro', 'TallerPro Soporte Técnico', '+506 0000-0000', 'info@tallerpro.local', 'San José, Costa Rica', 'CRC', 13, 'Gracias por confiar en nuestro taller.')
on conflict do nothing;

insert into public.notifications (title, message, type, due_at)
values
  ('Revisar pendientes', 'Hay equipos que deben actualizar su diagnóstico.', 'warning', now() + interval '1 day'),
  ('Configura tu taller', 'Actualiza logo, moneda, impuestos y datos de impresión.', 'info', now())
on conflict do nothing;
