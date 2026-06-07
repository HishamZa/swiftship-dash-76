import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { fetchShipments, type Shipment } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { markShipmentsSeen } from "@/lib/unreadNews";
import { Search } from "lucide-react";
import {
  buildTestShipment,
  isTestShipmentId,
  TEST_REMAINING_TEXT,
} from "@/lib/testShipment";
import { TestShipmentRibbon } from "@/components/TestShipmentRibbon";

export const Route = createFileRoute("/_authenticated/shipments/")({
  head: () => ({ meta: [{ title: "My Shipments — Almwanaa" }] }),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const { t, lang } = useI18n();
  const { user, isStaff } = useAuth();
  const [list, setList] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const opts = isStaff ? { search } : { customerId: user.id, search };
    fetchShipments(opts).then(setList).catch(() => setList([])).finally(() => setLoading(false));
    if (!isStaff && user) markShipmentsSeen(user.id);
  }, [user, isStaff, search]);

  // Inject the onboarding test shipment ONLY when the customer has no real
  // shipments and is not searching. It is purely client-side and never hits
  // any counters, admin lists, search results, or stats.
  const showTest =
    !isStaff && !!user && !search.trim() && !loading && list.length === 0;
  const displayList: Shipment[] = showTest
    ? [
        buildTestShipment(
          user.id,
          (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
        ),
      ]
    : list;

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("myShipments")}</h1>
      </section>

      <section className="px-5">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 mb-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
        </div>

        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && displayList.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}

        <div className="space-y-2">
          {displayList.map((s) => {
            const isTest = isTestShipmentId(s.id);
            const cd = isTest
              ? TEST_REMAINING_TEXT[lang]
              : deliveryCountdown(s.estimated_delivery, lang);
            return (
              <Link
                key={s.id}
                to="/shipments/$id"
                params={{ id: s.id }}
                className="relative block rounded-2xl border bg-card p-4 overflow-hidden"
              >
                {isTest && <TestShipmentRibbon />}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{s.tracking_number}</p>
                    {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{s.origin_country} → {s.destination_country}</p>
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>{formatUSD(s.estimated_cost)}</span>
                      <span>{formatCBM(s.cbm_volume)}</span>
                      {s.estimated_delivery && <span>{t("eta")}: {s.estimated_delivery}</span>}
                      {cd && <span className="font-semibold text-primary">{cd}</span>}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
