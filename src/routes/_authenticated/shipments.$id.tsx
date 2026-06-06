import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { fetchShipment, fetchHistory, deleteShipment, type Shipment, type StatusHistory } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusProgress } from "@/components/StatusProgress";
import { StatusTimeline } from "@/components/StatusTimeline";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/shipments/$id")({
  head: () => ({ meta: [{ title: "Shipment — Almwanaa" }] }),
  component: ShipmentDetailPage,
});

function ShipmentDetailPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { isStaff } = useAuth();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([fetchShipment(id), fetchHistory(id)])
      .then(([s, h]) => { setShipment(s); setHistory(h); })
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteShipment(id);
      toast.success(t("delete"));
      navigate({ to: isStaff ? "/admin-shipments" : "/shipments" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  if (loading) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("loading")}</p></Layout>;
  if (!shipment) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("notFound")}</p></Layout>;

  const cd = deliveryCountdown(shipment.estimated_delivery, lang);

  return (
    <Layout>
      <section className="px-5 pt-6 pb-2">
        <h1 className="text-xl font-bold">{t("shipmentDetails")}</h1>
      </section>

      <section className="px-5 space-y-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("trackingNo")}</p>
              <p className="font-bold text-lg">{shipment.tracking_number}</p>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
          <Row label={t("customer")} value={shipment.customer_name} />
          <Row label={t("origin")} value={shipment.origin_country} />
          <Row label={t("destination")} value={shipment.destination_country} />
          {shipment.description && <Row label={t("description")} value={shipment.description} />}
          <Row label={t("estimatedCost")} value={formatUSD(shipment.estimated_cost)} />
          <Row label={t("cbm")} value={formatCBM(shipment.cbm_volume)} />
          {shipment.estimated_delivery && <Row label={t("eta")} value={shipment.estimated_delivery} />}
          {cd && <Row label={t("remaining")} value={cd} highlight />}
          {shipment.customer_notes && (
            <div className="mt-3 rounded-xl bg-muted/40 p-3">
              <p className="text-[11px] text-muted-foreground mb-1">{t("customerNotes")}</p>
              <p className="text-sm whitespace-pre-wrap">{shipment.customer_notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">{t("status")}</h2>
          <StatusProgress current={shipment.status} />
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">{t("timeline")}</h2>
          <StatusTimeline history={history} />
        </div>

        {isStaff && (
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
        )}
      </section>
    </Layout>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
