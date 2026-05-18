export type UserRole = "admin" | "technician";

export type DeviceType =
  | "Laptop"
  | "PC de escritorio"
  | "Impresora"
  | "Consola"
  | "Celular"
  | "Tablet"
  | "Otro";

export type DeviceStatus =
  | "Recibido"
  | "Diagnosticando"
  | "Esperando repuesto"
  | "En reparación"
  | "Reparado"
  | "Entregado"
  | "Cancelado";

export type RepairStatus = "Pendiente" | "Diagnosticando" | "En reparación" | "Terminada" | "Entregada" | "Cancelada";
export type PaymentStatus = "Pendiente" | "Parcial" | "Pagado" | "Anulado";
export type InvitationStatus = "pending" | "used" | "expired" | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  document_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  client_id: string;
  order_number: string;
  type: DeviceType;
  brand: string;
  model: string | null;
  serial_number: string | null;
  received_accessories: string | null;
  physical_condition: string | null;
  device_password: string | null;
  observations: string | null;
  status: DeviceStatus;
  entry_date: string;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  clients?: Pick<Client, "full_name" | "phone" | "email">;
  device_photos?: DevicePhoto[];
}

export interface DevicePhoto {
  id: string;
  device_id: string;
  file_path: string;
  file_name: string;
  created_at: string;
}

export interface Repair {
  id: string;
  device_id: string;
  technician_id: string | null;
  diagnosis: string | null;
  solution: string | null;
  parts_used: string | null;
  parts_cost: number;
  labor_cost: number;
  total: number;
  status: RepairStatus;
  started_at: string;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  warranty_days: number;
  internal_comments: string | null;
  customer_signature_url: string | null;
  created_at: string;
  updated_at: string;
  devices?: Pick<Device, "order_number" | "brand" | "model" | "serial_number" | "status"> & {
    clients?: Pick<Client, "full_name" | "phone" | "email">;
  };
  profiles?: Pick<Profile, "full_name">;
}

export interface RepairStatusHistory {
  id: string;
  repair_id: string;
  previous_status: RepairStatus | null;
  new_status: RepairStatus;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  repair_id: string;
  invoice_number: string;
  subtotal: number;
  tax: number;
  total: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  issued_at: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read_at: string | null;
  due_at: string | null;
  created_at: string;
}

export interface WorkshopSettings {
  id: string;
  workshop_name: string;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  currency: string;
  tax_rate: number;
  print_footer: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInvitation {
  id: string;
  token: string;
  status: InvitationStatus;
  created_by: string;
  used_by_client_id: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  cancelled_at: string | null;
  profiles?: Pick<Profile, "full_name">;
  clients?: Pick<Client, "full_name" | "email">;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
