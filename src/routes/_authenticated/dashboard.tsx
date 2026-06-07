import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchShipments, type Shipment, ACTIVE_STATUSES } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { formatUSD, formatCBM, deliveryCountdown } from "@/lib/format";
import { Package, CheckCircle, Truck, Bell, Search, Newspaper, MapPin } from "lucide-react";
import { useUnreadNewsCount, useUnreadShipmentsCount, useUnreadNotificationsCount } from "@/lib/unreadNews";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Almwanaa" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = useI18n();
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const unreadNews = useUnreadNewsCount(user?.id);
  const unreadShipments = useUnreadShipmentsCount(user?.id);
  const unreadNotifications = useUnreadNotificationsCount(user?.id);

  useEffect(() => {
    if (isStaff) { navigate({ to: "/admin", replace: true }); return; }
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
    <Layout showBack={false}>
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
        <NavTile to="/shipments" icon={Package} label={t("myShipments")} badge={unreadShipments} />
        <NavTile to="/track" icon={Search} label={t("trackBtn")} />
        <NavTile to="/notifications" icon={Bell} label={t("notifications")} badge={unreadNotifications} />
        <NavTile to="/announcements" icon={Newspaper} label={t("news")} badge={unreadNews} />
        <NavTile to="/offices" icon={MapPin} label={t("offices")} />
        <NavTile to="/addresses" icon={MapPin} label={t("addressBook")} />
      </section>

      <section className="px-5 mt-6">
        <h2 className="font-semibold mb-3 text-sm">{t("recent")}</h2>
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && shipments.length === 0 && <p className="text-sm text-muted-foreground whitespace-pre-line">{t("empty")}</p>}
        <div className="space-y-2">
          {shipments.slice(0, 8).map((s) => {
            const cd = deliveryCountdown(s.estimated_delivery, lang);
            return (
              <Link key={s.id} to="/shipments/$id" params={{ id: s.id }} className="block rounded-2xl border bg-card p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{s.tracking_number}</p>
                    {s.description && <p className="text-xs text-muted-foreground truncate">{s.description}</p>}
                    <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>{formatUSD(s.estimated_cost)}</span>
                      <span>{formatCBM(s.cbm_volume)}</span>
                      {cd && <span className="font-medium text-primary">{cd}</span>}
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

function NavTile({ to, icon: Icon, label, badge }: { to: string; icon: typeof Package; label: string; badge?: number }) {
  return (
    <Link to={to} className="relative rounded-2xl border bg-card p-4 flex flex-col items-start gap-2">
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-primary/10 text-primary"><Icon className="w-4 h-4" /></span>
      <span className="text-sm font-semibold">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute top-2 end-2 min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
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
