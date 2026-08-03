import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchShipmentByTracking, fetchHistory, type Shipment, type StatusHistory } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusProgress } from "@/components/StatusProgress";
import { StatusTimeline } from "@/components/StatusTimeline";
import { formatUSD, formatCBM, deliveryCountdown, formatDate } from "@/lib/format";
import { AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/t/$tracking")({
  head: () => ({
    meta: [
      { title: "Shipment Tracking — Almwanaa" },
      { name: "description", content: "Track the status and timeline of an Almwanaa shipment with its public tracking link." },
      { property: "og:title", content: "Shipment Tracking — Almwanaa" },
      { property: "og:description", content: "Track the status and timeline of an Almwanaa shipment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PublicTrackPage,
});

function PublicTrackPage() {
  const { tracking } = Route.useParams();
  const { t, lang } = useI18n();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchShipmentByTracking(tracking)
      .then(async (s) => {
        setShipment(s);
        setHistory(s ? await fetchHistory(s.id) : []);
      })
      .catch(() => setShipment(null))
      .finally(() => setLoading(false));
  }, [tracking]);

  const cd = shipment ? deliveryCountdown(shipment.estimated_delivery, lang) : null;

  return (
    <Layout showBack={false} logoLink={false}>
      <section className="px-5 pt-6 pb-6 bg-primary text-primary-foreground rounded-b-3xl">
        <h1 className="text-xl font-bold">{t("trackTitle")}</h1>
        <p className="text-sm opacity-90 break-all mt-1">{tracking}</p>
      </section>

      <section className="px-5 py-5">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && !shipment && (
          <div className="rounded-2xl border bg-card p-6 text-center">
            <AlertCircle className="mx-auto w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t("notFound")}</p>
          </div>
        )}
        {!loading && shipment && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t("trackingNo")}</p>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-lg break-all">{shipment.tracking_number}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      aria-label={t("copyTracking")}
                      onClick={() => {
                        navigator.clipboard.writeText(shipment.tracking_number);
                        toast.success(t("trackingCopied"));
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <Row label={t("origin")} value={shipment.origin_country} />
              <Row label={t("destination")} value={shipment.destination_country} />
              {shipment.description && <Row label={t("description")} value={shipment.description} />}
              <Row label={t("estimatedCost")} value={formatUSD(shipment.estimated_cost)} />
              <Row label={t("cbm")} value={formatCBM(shipment.cbm_volume)} />
              {shipment.estimated_delivery && <Row label={t("eta")} value={formatDate(shipment.estimated_delivery)} />}
              {cd && <Row label={t("remaining")} value={cd} highlight />}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold mb-4">{t("status")}</h2>
              <StatusProgress current={shipment.status} />
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold mb-4">{t("timeline")}</h2>
              <StatusTimeline history={history} />
            </div>
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
