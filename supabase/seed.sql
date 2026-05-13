-- Datos de prueba opcionales.
-- Ejecutar después de crear al menos un usuario en Supabase Auth y convertirlo en admin/técnico si se desea.

insert into public.clients (full_name, document_id, phone, email, address, notes)
values
  ('María Fernández', '1-1111-1111', '+506 8888-0101', 'maria@example.com', 'San José', 'Prefiere contacto por WhatsApp'),
  ('Carlos Jiménez', '2-2222-2222', '+506 8888-0202', 'carlos@example.com', 'Heredia', 'Cliente frecuente'),
  ('Ana Rodríguez', '3-3333-3333', '+506 8888-0303', 'ana@example.com', 'Alajuela', null)
on conflict do nothing;

insert into public.devices (client_id, type, brand, model, serial_number, received_accessories, physical_condition, observations, status)
select id, 'Laptop', 'Lenovo', 'ThinkPad E14', 'SN-LEN-001', 'Cargador original', 'Rayones leves en tapa', 'No enciende', 'Diagnosticando'
from public.clients
where email = 'maria@example.com'
limit 1;

insert into public.devices (client_id, type, brand, model, serial_number, received_accessories, physical_condition, observations, status)
select id, 'PC de escritorio', 'Clon', 'Ryzen 5', 'SN-PC-002', 'Cable de poder', 'Buen estado', 'Lentitud general', 'En reparación'
from public.clients
where email = 'carlos@example.com'
limit 1;

insert into public.repairs (device_id, diagnosis, solution, parts_used, parts_cost, labor_cost, status, warranty_days, internal_comments)
select id, 'Fuente interna dañada', 'Pendiente de repuesto', 'Fuente compatible', 25000, 15000, 'En reparación', 30, 'Confirmar disponibilidad del repuesto'
from public.devices
where serial_number = 'SN-LEN-001'
limit 1;

insert into public.repairs (device_id, diagnosis, solution, parts_used, parts_cost, labor_cost, status, warranty_days)
select id, 'Sistema con malware y disco saturado', 'Limpieza, optimización y mantenimiento preventivo', 'Pasta térmica', 3500, 22000, 'Terminada', 15
from public.devices
where serial_number = 'SN-PC-002'
limit 1;
