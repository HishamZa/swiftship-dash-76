import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { fetchShipments, type Shipment } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shipments")({
  head: () => ({ meta: [{ title: "My Shipments — Almwanaa" }] }),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const { t } = useI18n();
  const { user, isStaff } = useAuth();
  const [list, setList] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const opts = isStaff ? { search } : { customerId: user.id, search };
    fetchShipments(opts).then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, [user, isStaff, search]);

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
        {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}

        <div className="space-y-2">
          {list.map((s) => (
            <Link key={s.id} to="/track" search={{ q: s.tracking_number }} className="block rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.origin_country} → {s.destination_country}</p>
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                    {s.estimated_cost != null && <span>{t("estimatedCost")}: {s.estimated_cost}</span>}
                    {s.cbm_volume != null && <span>{t("cbm")}: {s.cbm_volume}</span>}
                    {s.estimated_delivery && <span>{t("eta")}: {s.estimated_delivery}</span>}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
