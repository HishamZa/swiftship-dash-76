import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  fetchShipments, createShipment, updateShipment, deleteShipment,
  ALL_STATUSES, statusKey, type Shipment, type ShipmentStatus,
} from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/shipments")({
  head: () => ({ meta: [{ title: "Shipments — Almwanaa" }] }),
  component: ShipmentsPage,
});

const empty = {
  tracking_number: "",
  customer_name: "",
  phone: "",
  origin_country: "",
  destination_country: "",
  shipment_type: "",
  weight: "",
  status: "received" as ShipmentStatus,
  notes: "",
  estimated_delivery: "",
};

function ShipmentsPage() {
  const { t } = useI18n();
  const { user, isStaff } = useAuth();
  const [list, setList] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    try {
      const opts: Parameters<typeof fetchShipments>[0] = { search, status: statusFilter };
      if (!isStaff && user) opts.customerId = user.id;
      setList(await fetchShipments(opts));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, isStaff, statusFilter]);

  const onSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (s: Shipment) => {
    setEditing(s);
    setForm({
      tracking_number: s.tracking_number,
      customer_name: s.customer_name,
      phone: s.phone ?? "",
      origin_country: s.origin_country,
      destination_country: s.destination_country,
      shipment_type: s.shipment_type ?? "",
      weight: s.weight != null ? String(s.weight) : "",
      status: s.status,
      notes: s.notes ?? "",
      estimated_delivery: s.estimated_delivery ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tracking_number: form.tracking_number.trim(),
        customer_name: form.customer_name.trim(),
        phone: form.phone || null,
        origin_country: form.origin_country.trim(),
        destination_country: form.destination_country.trim(),
        shipment_type: form.shipment_type || null,
        weight: form.weight ? Number(form.weight) : null,
        status: form.status,
        notes: form.notes || null,
        estimated_delivery: form.estimated_delivery || null,
      };
      if (editing) await updateShipment(editing.id, payload);
      else await createShipment(payload);
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete shipment?")) return;
    try { await deleteShipment(id); toast.success("Deleted"); load(); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Error"); }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{isStaff ? t("nav_shipments") : t("myShipments")}</h1>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /></Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editing ? t("edit") : t("add")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-2">
                <Input required placeholder={t("trackingNo")} value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} />
                <Input required placeholder={t("customer")} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                <Input placeholder={t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input required placeholder={t("origin")} value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value })} />
                  <Input required placeholder={t("destination")} value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder={t("shipmentType")} value={form.shipment_type} onChange={(e) => setForm({ ...form, shipment_type: e.target.value })} />
                  <Input type="number" step="0.01" placeholder={t("weight")} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <Input type="date" placeholder={t("eta")} value={form.estimated_delivery} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })} />
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ShipmentStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(statusKey(s))}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button type="submit" className="w-full">{t("save")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </section>

      <section className="px-5 space-y-3">
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-lg px-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShipmentStatus | "all")}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(statusKey(s))}</SelectItem>)}
            </SelectContent>
          </Select>
        </form>

        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}

        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.customer_name} · {s.phone ?? "-"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.origin_country} → {s.destination_country}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              {isStaff && (
                <div className="mt-3 flex gap-2 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
