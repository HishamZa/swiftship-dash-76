import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchShipments, type Shipment, ACTIVE_STATUSES } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, CheckCircle, Truck, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Almwanaa" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isStaff) {
      navigate({ to: "/admin", replace: true });
      return;
    }
    if (!user) return;
    fetchShipments({ customerId: user.id })
      .then(setShipments).catch(() => setShipments([]))
      .finally(() => setLoading(false));
  }, [user, isStaff, navigate]);

  if (isStaff) return null;

  const total = shipments.length;
  const active = shipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("welcome")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{user?.user_metadata?.full_name ?? user?.email}</p>
      </section>

      <section className="px-5 grid grid-cols-3 gap-3">
        <Stat icon={Package} label={t("totalShipments")} value={total} tint="bg-primary/10 text-primary" />
        <Stat icon={Truck} label={t("activeShipments")} value={active} tint="bg-accent/20 text-accent-foreground" />
        <Stat icon={CheckCircle} label={t("deliveredShipments")} value={delivered} tint="bg-success/20 text-success-foreground" />
      </section>

      <section className="px-5 mt-6 grid grid-cols-2 gap-3">
        <Link to="/shipments" className="rounded-2xl border bg-card p-4 flex flex-col items-start gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">{t("myShipments")}</span>
        </Link>
        <Link to="/notifications" className="rounded-2xl border bg-card p-4 flex flex-col items-start gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">{t("notifications")}</span>
        </Link>
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-semibold mb-3 text-sm">{t("myShipments")}</h2>
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && shipments.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-2">
          {shipments.slice(0, 8).map((s) => (
            <Link key={s.id} to="/track" search={{ q: s.tracking_number }} className="block rounded-2xl border bg-card p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-sm">{s.tracking_number}</p>
                  <p className="text-xs text-muted-foreground">{s.origin_country} → {s.destination_country}</p>
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
      <div className={`grid place-items-center w-8 h-8 rounded-lg ${tint} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
