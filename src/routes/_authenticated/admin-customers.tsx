import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  fetchCustomers, fetchShipments, fetchAllUserRoles, fetchHistory, updateShipment, deleteShipment,
  ALL_STATUSES, statusKey, type Profile, type Shipment, type ShipmentStatus, type StatusHistory,
} from "@/lib/db";
import { StatusProgress } from "@/components/StatusProgress";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Search, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin-customers")({
  head: () => ({ meta: [{ title: "Shipment Management — Almwanaa" }] }),
  component: AdminCustomersPage,
});

function AdminCustomersPage() {
  const { t, lang } = useI18n();
  const { isStaff, role, loading } = useAuth();
  const hidePhone = role === "employee";
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [editing, setEditing] = useState<Shipment | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    (async () => {
      const [profiles, rolesMap, allShipments] = await Promise.all([
        fetchCustomers(search).catch(() => [] as Profile[]),
        fetchAllUserRoles().catch(() => ({} as Record<string, string[]>)),
        fetchShipments().catch(() => [] as Shipment[]),
      ]);
      // Customers only: no admin/manager/employee
      const onlyCustomers = profiles.filter((p) => {
        const roles = rolesMap[p.id] ?? [];
        return !roles.some((r) => r === "admin" || r === "manager" || r === "employee");
      });
      const cnt: Record<string, number> = {};
      const latest: Record<string, string> = {};
      for (const s of allShipments) {
        if (s.customer_id) {
          cnt[s.customer_id] = (cnt[s.customer_id] ?? 0) + 1;
          if (!latest[s.customer_id] || s.created_at > latest[s.customer_id]) {
            latest[s.customer_id] = s.created_at;
          }
        }
      }
      const sorted = [...onlyCustomers].sort((a, b) => {
        const da = latest[a.id];
        const db = latest[b.id];
        if (da && db) return db.localeCompare(da);
        if (da) return -1;
        if (db) return 1;
        return 0;
      });
      setCustomers(sorted);
      setCounts(cnt);
    })();
  }, [isStaff, loading, navigate, search]);

  useEffect(() => {
    if (!selected) return;
    fetchShipments({ customerId: selected.id }).then(setShipments).catch(() => setShipments([]));
  }, [selected]);

  if (!isStaff) return null;

  if (editing) {
    return <EditShipment shipment={editing} onClose={() => {
      setEditing(null);
      if (selected) fetchShipments({ customerId: selected.id }).then(setShipments);
    }} />;
  }

  if (selected) {
    return (
      <Layout>
        <section className="px-5 pt-6 pb-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-lg font-bold">
              {selected.full_name ?? "—"}
              {selected.customer_code && <span className="ms-1 text-xs font-normal text-muted-foreground/70">#{selected.customer_code}</span>}
            </h1>
            <p className="text-xs text-muted-foreground">{hidePhone ? "—" : selected.phone}{selected.governorate ? ` · ${selected.governorate}` : ""}{selected.area ? ` / ${selected.area}` : ""}</p>
          </div>
        </section>
        <section className="px-5 mt-2 space-y-2">
          {shipments.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
          {shipments.map((s) => {
            const cd = deliveryCountdown(s.estimated_delivery, lang);
            return (
              <button key={s.id} onClick={() => setEditing(s)} className="block w-full text-start rounded-2xl border bg-card p-4 hover:bg-muted/40 transition">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{s.tracking_number}</p>
                    {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatUSD(s.estimated_cost)} · {formatCBM(s.cbm_volume)}</p>
                    {cd && <p className="text-[11px] font-semibold text-primary mt-1">{cd}</p>}
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </button>
            );
          })}
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("manageShipments")}</h1>
      </section>
      <section className="px-5">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 mb-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
        </div>
        <div className="space-y-2">
          {customers.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
          {customers.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)} className="block w-full text-start rounded-2xl border bg-card p-4 hover:bg-muted/40 transition">
              <div className="flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {c.full_name ?? "—"}
                    {c.customer_code && <span className="ms-1 text-[11px] font-normal text-muted-foreground/70">#{c.customer_code}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{c.phone ?? "—"}{c.governorate ? ` · ${c.governorate}` : ""}{c.area ? ` / ${c.area}` : ""}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-1 shrink-0">
                  <Package className="w-3 h-3" /> {counts[c.id] ?? 0}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function EditShipment({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<ShipmentStatus>(shipment.status);
  const [description, setDescription] = useState(shipment.description ?? "");
  const [cost, setCost] = useState(shipment.estimated_cost?.toString() ?? "");
  const [cbm, setCbm] = useState(shipment.cbm_volume?.toString() ?? "");
  const [eta, setEta] = useState(shipment.estimated_delivery ?? "");
  const [customerNotes, setCustomerNotes] = useState(shipment.customer_notes ?? "");
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [busy, setBusy] = useState(false);
  const cd = deliveryCountdown(eta, lang);

  const loadHistory = () => fetchHistory(shipment.id).then(setHistory).catch(() => setHistory([]));
  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, [shipment.id]);

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteShipment(shipment.id);
      toast.success(t("delete"));
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateShipment(shipment.id, {
        status,
        description: description || null,
        estimated_cost: cost ? Number(cost) : null,
        cbm_volume: cbm ? Number(cbm) : null,
        estimated_delivery: eta || null,
        customer_notes: customerNotes || null,
      });
      toast.success(t("save"));
      await loadHistory();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-4 h-4" /></Button>
        <h1 className="text-lg font-bold">{shipment.tracking_number}</h1>
      </section>
      <section className="px-5 space-y-3">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">{t("status")}</h2>
          <StatusProgress current={status} />
          <div className="mt-3">
            <Select value={status} onValueChange={(v) => setStatus(v as ShipmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(statusKey(s))}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">{t("description")}</label>
            <Input placeholder={t("descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">{t("estimatedCost")} ($)</label>
              <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("cbm")} (CBM)</label>
              <Input type="number" step="0.001" value={cbm} onChange={(e) => setCbm(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("eta")}</label>
            <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
            {cd && <p className="text-[11px] font-semibold text-primary mt-1">{cd}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("customerNotes")}</label>
            <Textarea rows={3} value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
          </div>
          <Button className="w-full" onClick={save} disabled={busy}>{t("save")}</Button>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold text-sm mb-3">{t("timeline")}</h2>
          <StatusTimeline history={history} />
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={busy}>
                <Trash2 className="w-4 h-4 me-1" /> {t("deleteShipment")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteShipment")}</AlertDialogTitle>
                <AlertDialogDescription>{t("confirmDelete")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("confirm")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </Layout>
  );
}
