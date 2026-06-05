import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { fetchShipmentByTracking, fetchHistory, type Shipment, type StatusHistory } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusProgress } from "@/components/StatusProgress";
import { Search, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({ meta: [{ title: "Track — Almwanaa" }] }),
  component: TrackPage,
});

function TrackPage() {
  const { t } = useI18n();
  const { q } = Route.useSearch();
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [searched, setSearched] = useState(false);

  const run = async (tracking: string) => {
    if (!tracking.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const s = await fetchShipmentByTracking(tracking.trim());
      setShipment(s);
      if (s) setHistory(await fetchHistory(s.id));
      else setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (q) run(q); }, [q]);

  return (
    <Layout>
      <section className="px-5 pt-6 pb-8 bg-primary text-primary-foreground rounded-b-3xl">
        <h1 className="text-xl font-bold mb-3">{t("trackTitle")}</h1>
        <form onSubmit={(e) => { e.preventDefault(); run(input); }} className="flex gap-2 bg-card text-foreground p-2 rounded-2xl">
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("trackPlaceholder")} className="border-0 shadow-none focus-visible:ring-0 px-0" />
          </div>
          <Button type="submit" size="sm" disabled={loading}>{t("trackBtn")}</Button>
        </form>
      </section>

      <section className="px-5 py-5">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && searched && !shipment && (
          <div className="rounded-2xl border bg-card p-6 text-center">
            <AlertCircle className="mx-auto w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t("notFound")}</p>
          </div>
        )}
        {!loading && shipment && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("trackingNo")}</p>
                  <p className="font-bold text-lg">{shipment.tracking_number}</p>
                </div>
                <StatusBadge status={shipment.status} />
              </div>
              <Grid label={t("customer")} value={shipment.customer_name} />
              <Grid label={t("origin")} value={shipment.origin_country} />
              <Grid label={t("destination")} value={shipment.destination_country} />
              {shipment.shipment_type && <Grid label={t("shipmentType")} value={shipment.shipment_type} />}
              {shipment.weight != null && <Grid label={t("weight")} value={String(shipment.weight)} />}
              {shipment.estimated_delivery && <Grid label={t("eta")} value={shipment.estimated_delivery} />}
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

function Grid({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
