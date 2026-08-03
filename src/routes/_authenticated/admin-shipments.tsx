import { formatDate } from "@/lib/format";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchShipments, fetchCustomers, ALL_STATUSES, statusKey, type Shipment, type ShipmentStatus } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { Search, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyTrackingLink } from "@/lib/trackingLink";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin-shipments")({
  head: () => ({ meta: [{ title: "All Shipments — Almwanaa" }] }),
  component: AdminShipmentsPage,
});

function AdminShipmentsPage() {
  const { t, lang } = useI18n();
  const { isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<Shipment[]>([]);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "all">("all");

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    fetchShipments({ status: statusFilter }).then(setList).catch(() => setList([]));
    fetchCustomers().then((profs) => {
      const map: Record<string, string> = {};
      for (const p of profs) if (p.customer_code) map[p.id] = p.customer_code;
      setCodeMap(map);
    }).catch(() => setCodeMap({}));
  }, [isStaff, loading, navigate, statusFilter]);

  const filtered = (() => {
    const q = search.trim().replace(/#/g, "").toLowerCase();
    if (!q) return list;
    return list.filter((s) => {
      const code = (s.customer_id && codeMap[s.customer_id]) || "";
      return s.tracking_number.toLowerCase().includes(q)
        || s.customer_name.toLowerCase().includes(q)
        || (s.phone ?? "").toLowerCase().includes(q)
        || code.toLowerCase().includes(q);
    });
  })();

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

        {filtered.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-2">
          {filtered.map((s) => {
            const cd = deliveryCountdown(s.estimated_delivery, lang);
            const code = s.customer_id ? codeMap[s.customer_id] : null;
            return (
              <Link
                key={s.id}
                to="/admin-shipment-edit/$id"
                params={{ id: s.id }}
                className="block rounded-2xl border bg-card p-4 hover:bg-muted/40 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{s.tracking_number}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.customer_name}
                      {code && <span className="ms-1 text-muted-foreground/70">#{code}</span>}
                    </p>
                    {s.description && <p className="text-[11px] text-muted-foreground truncate">{s.description}</p>}
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>{formatUSD(s.estimated_cost)}</span>
                      <span>{formatCBM(s.cbm_volume)}</span>
                      {s.estimated_delivery && <span>{t("eta")}: {s.estimated_delivery}</span>}
                      {cd && <span className="font-semibold text-primary">{cd}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatDate(s.created_at)}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 px-2 text-[11px]"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await copyTrackingLink(s.tracking_number);
                        toast.success(t("trackingLinkCopied"));
                      }}
                    >
                      <Link2 className="w-3 h-3 me-1" /> {t("copyTrackingLink")}
                    </Button>
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
