import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Client, Device, Invoice, NotificationItem, Repair, RepairStatusHistory, WorkshopSettings } from "@/types/database";
import type { Profile } from "@/types/database";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      if (error) throw error;
      return data as {
        devices_in_repair: number;
        devices_delivered: number;
        repairs_pending: number;
        repairs_finished: number;
        monthly_income: number;
      };
    },
  });
}

export function useMonthlyIncome() {
  return useQuery({
    queryKey: ["monthly-income"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_monthly_income");
      if (error) throw error;
      return data as { month: string; income: number }[];
    },
  });
}

export function useClients(search = "") {
  return useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      let query = supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,document_id.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Client;
    },
    enabled: Boolean(id),
  });
}

export function useClientHistory(id?: string) {
  return useQuery({
    queryKey: ["client-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*, repairs(*, profiles(full_name))")
        .eq("client_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Array<Device & { repairs: Repair[] }>;
    },
    enabled: Boolean(id),
  });
}

export function useUpsertClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Client>) => {
      const { data, error } = await supabase.from("clients").upsert(payload).select("*").single();
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clients"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDevices(search = "") {
  return useQuery({
    queryKey: ["devices", search],
    queryFn: async () => {
      let query = supabase
        .from("devices")
        .select("*, clients(full_name, phone, email), device_photos(*)")
        .order("created_at", { ascending: false });
      if (search) {
        query = query.or(`order_number.ilike.%${search}%,serial_number.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Device[];
    },
  });
}

export function useUpsertDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Device>) => {
      const { data, error } = await supabase.from("devices").upsert(payload).select("*").single();
      if (error) throw error;
      return data as Device;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });
}

export function useRepairs(search = "") {
  return useQuery({
    queryKey: ["repairs", search],
    queryFn: async () => {
      let query = supabase
        .from("repairs")
        .select("*, devices(order_number, brand, model, serial_number, status, clients(full_name, phone, email)), profiles(full_name)")
        .order("created_at", { ascending: false });
      if (search) query = query.or(`diagnosis.ilike.%${search}%,solution.ilike.%${search}%,parts_used.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data as Repair[];
    },
  });
}

export function useRepairHistory(repairId?: string) {
  return useQuery({
    queryKey: ["repair-history", repairId],
    queryFn: async () => {
      const { data, error } = await supabase.from("repair_status_history").select("*").eq("repair_id", repairId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as RepairStatusHistory[];
    },
    enabled: Boolean(repairId),
  });
}

export function useUpsertRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Repair>) => {
      const { data, error } = await supabase.from("repairs").upsert(payload).select("*").single();
      if (error) throw error;
      return data as Repair;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["repairs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["monthly-income"] });
    },
  });
}

export function useDeleteRepair() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("repairs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["repairs"] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as NotificationItem[];
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("issued_at", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").limit(1).single();
      if (error) throw error;
      return data as WorkshopSettings;
    },
  });
}

export function useTechnicians() {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("role", ["admin", "technician"]).order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<WorkshopSettings>) => {
      const { data, error } = await supabase.from("settings").upsert(payload).select("*").single();
      if (error) throw error;
      return data as WorkshopSettings;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export async function uploadDevicePhoto(deviceId: string, file: File) {
  const fileExt = file.name.split(".").pop();
  const safeName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${deviceId}/${safeName}`;
  const { error: uploadError } = await supabase.storage.from("device-media").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("device_photos")
    .insert({ device_id: deviceId, file_path: filePath, file_name: file.name })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_invitations')
        .select('*, profiles(full_name), clients(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as import('@/types/database').ClientInvitation[];
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('No auth');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours
      const { data, error } = await supabase
        .from('client_invitations')
        .insert({
          created_by: userData.user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as import('@/types/database').ClientInvitation;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('client_invitations')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as import('@/types/database').ClientInvitation;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  });
}

