import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchShipments, type Shipment, ACTIVE_STATUSES } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, CheckCircle, Truck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Almwanaa" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const { user, isStaff, roles } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchShipments(isStaff ? {} : { customerId: user.id })
      .then(setShipments).catch(() => setShipments([]))
      .finally(() => setLoading(false));
  }, [user, isStaff]);

  const total = shipments.length;
  const active = shipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const delayed = shipments.filter((s) => s.status === "delayed").length;

  const monthly = lastSixMonths(shipments);

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("dashboardTitle")}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {roles.length > 0 ? roles.map((r) => t(r === "admin" ? "admin" : r === "employee" ? "employee" : "nav_account")).join(" · ") : t("welcome")}
        </p>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <Stat icon={Package} label={t("totalShipments")} value={total} tint="bg-primary/10 text-primary" />
        <Stat icon={Truck} label={t("activeShipments")} value={active} tint="bg-accent/20 text-accent-foreground" />
        <Stat icon={CheckCircle} label={t("deliveredShipments")} value={delivered} tint="bg-success/20 text-success-foreground" />
        <Stat icon={AlertTriangle} label={t("delayedShipments")} value={delayed} tint="bg-warning/30 text-warning-foreground" />
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-semibold mb-3 text-sm">{t("monthlyStats")}</h2>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-end gap-2 h-32">
            {monthly.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${Math.max(4, (m.count / Math.max(1, ...monthly.map((x) => x.count))) * 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-semibold mb-3 text-sm">{isStaff ? t("recent") : t("myShipments")}</h2>
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && shipments.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-2">
          {shipments.slice(0, 8).map((s) => (
            <Link key={s.id} to="/track" search={{ q: s.tracking_number }} className="block rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-sm">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground">{s.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.origin_country} → {s.destination_country}</p>
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

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Package; label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className={`grid place-items-center w-9 h-9 rounded-xl ${tint} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function lastSixMonths(items: Shipment[]) {
  const now = new Date();
  const buckets: { label: string; count: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.push({ label: d.toLocaleString("default", { month: "short" }), count: 0, key });
  }
  for (const s of items) {
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.count += 1;
  }
  return buckets;
}
