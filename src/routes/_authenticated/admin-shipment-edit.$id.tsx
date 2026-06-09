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
  fetchShipment, fetchHistory, updateShipment, deleteShipment,
  ALL_STATUSES, statusKey, type Shipment, type ShipmentStatus, type StatusHistory,
} from "@/lib/db";
import { StatusProgress } from "@/components/StatusProgress";
import { StatusTimeline } from "@/components/StatusTimeline";
import { deliveryCountdown } from "@/lib/format";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin-shipment-edit/$id")({
  head: () => ({ meta: [{ title: "Edit Shipment — Almwanaa" }] }),
  component: AdminShipmentEditPage,
});

function AdminShipmentEditPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { isStaff, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    fetchShipment(id).then((s) => setShipment(s)).finally(() => setLoading(false));
  }, [id, isStaff, authLoading, navigate]);

  const [status, setStatus] = useState<ShipmentStatus>("received_warehouse");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [cbm, setCbm] = useState("");
  const [eta, setEta] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!shipment) return;
    setStatus(shipment.status);
    setDescription(shipment.description ?? "");
    setCost(shipment.estimated_cost?.toString() ?? "");
    setCbm(shipment.cbm_volume?.toString() ?? "");
    setEta(shipment.estimated_delivery ?? "");
    setCustomerNotes(shipment.customer_notes ?? "");
    fetchHistory(shipment.id).then(setHistory).catch(() => setHistory([]));
  }, [shipment]);

  if (loading || authLoading) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("loading")}</p></Layout>;
  if (!shipment) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("notFound")}</p></Layout>;

  const cd = deliveryCountdown(eta, lang);

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
      fetchHistory(shipment.id).then(setHistory).catch(() => {});
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteShipment(shipment.id);
      toast.success(t("delete"));
      navigate({ to: "/admin-shipments" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin-shipments" })}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">{shipment.tracking_number}</h1>
          <p className="text-xs text-muted-foreground truncate">{shipment.customer_name}</p>
        </div>
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
      </section>
    </Layout>
  );
}
