import { supabase } from "@/integrations/supabase/client";

export type ShipmentStatus =
  | "received"
  | "in_warehouse"
  | "ready"
  | "shipped"
  | "in_transit"
  | "arrived_destination"
  | "out_for_delivery"
  | "delivered"
  | "delayed"
  | "cancelled";

export const ALL_STATUSES: ShipmentStatus[] = [
  "received", "in_warehouse", "ready", "shipped", "in_transit",
  "arrived_destination", "out_for_delivery", "delivered", "delayed", "cancelled",
];

export const ACTIVE_STATUSES: ShipmentStatus[] = [
  "received", "in_warehouse", "ready", "shipped", "in_transit", "arrived_destination", "out_for_delivery",
];

export const statusKey = (s: ShipmentStatus) => `s_${s}` as const;

export type Shipment = {
  id: string;
  tracking_number: string;
  customer_id: string | null;
  customer_name: string;
  phone: string | null;
  origin_country: string;
  destination_country: string;
  shipment_type: string | null;
  weight: number | null;
  status: ShipmentStatus;
  notes: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusHistory = {
  id: string;
  shipment_id: string;
  status: ShipmentStatus;
  note: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title_en: string;
  title_ar: string | null;
  body_en: string | null;
  body_ar: string | null;
  published: boolean;
  created_at: string;
};

export type AddressEntry = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export type AppRole = "admin" | "employee" | "customer";

// ---- Shipments
export async function fetchShipments(opts?: { customerId?: string; search?: string; status?: ShipmentStatus | "all" }) {
  let q = supabase.from("shipments").select("*").order("created_at", { ascending: false });
  if (opts?.customerId) q = q.eq("customer_id", opts.customerId);
  if (opts?.status && opts.status !== "all") q = q.eq("status", opts.status);
  if (opts?.search) {
    const s = `%${opts.search}%`;
    q = q.or(`tracking_number.ilike.${s},customer_name.ilike.${s},phone.ilike.${s}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Shipment[];
}

export async function fetchShipmentByTracking(tracking: string) {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", tracking)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Shipment | null;
}

export async function fetchHistory(shipmentId: string) {
  const { data, error } = await supabase
    .from("shipment_status_history")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StatusHistory[];
}

export async function createShipment(p: Omit<Shipment, "id" | "created_at" | "updated_at" | "customer_id"> & { customer_id?: string | null }) {
  const { data, error } = await supabase.from("shipments").insert(p).select().single();
  if (error) throw error;
  return data as Shipment;
}

export async function updateShipment(id: string, p: Partial<Shipment>) {
  const { error } = await supabase.from("shipments").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteShipment(id: string) {
  const { error } = await supabase.from("shipments").delete().eq("id", id);
  if (error) throw error;
}

// ---- Announcements
export async function fetchAnnouncements(publishedOnly = false) {
  let q = supabase.from("announcements").select("*").order("created_at", { ascending: false });
  if (publishedOnly) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(p: Omit<Announcement, "id" | "created_at">) {
  const { error } = await supabase.from("announcements").insert(p);
  if (error) throw error;
}
export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// ---- Addresses
export async function fetchAddresses(userId: string) {
  const { data, error } = await supabase.from("addresses").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AddressEntry[];
}
export async function createAddress(p: Omit<AddressEntry, "id" | "created_at">) {
  const { error } = await supabase.from("addresses").insert(p);
  if (error) throw error;
}
export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

// ---- Notifications
export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Notification[];
}
export async function markAllRead(userId: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  if (error) throw error;
}

// ---- Roles
export async function fetchMyRoles(userId: string): Promise<AppRole[]> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) return [];
  return (data ?? []).map((r) => r.role as AppRole);
}
