import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchShipments, ALL_STATUSES, statusKey, type Shipment, type ShipmentStatus } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin-shipments")({
  head: () => ({ meta: [{ title: "All Shipments — Almwanaa" }] }),
  component: AdminShipmentsPage,
});

function AdminShipmentsPage() {
  const { t } = useI18n();
  const { isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    fetchShipments({ search, status: statusFilter }).then(setList).catch(() => setList([]));
  }, [isStaff, loading, navigate, search, statusFilter]);

  if (!isStaff) return null;

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("allShipments")}</h1>
      </section>
      <section className="px-5 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card border rounded-lg px-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ShipmentStatus | "all")}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(statusKey(s))}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="block rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.customer_name}</p>
                  {s.description && <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>}
                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                    <span>{formatUSD(s.estimated_cost)}</span>
                    <span>{formatCBM(s.cbm_volume)}</span>
                    {s.estimated_delivery && <span>{t("eta")}: {s.estimated_delivery}</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
