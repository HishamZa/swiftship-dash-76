import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchShipments, fetchCustomers, type Shipment, ACTIVE_STATUSES } from "@/lib/db";
import { Package, Users, Truck, CheckCircle, PlusCircle, Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Almwanaa" }] }),
  component: AdminHome,
});

function AdminHome() {
  const { t } = useI18n();
  const { isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    fetchShipments().then(setShipments).catch(() => setShipments([]));
    fetchCustomers().then((c) => setCustomerCount(c.length)).catch(() => setCustomerCount(0));
  }, [isStaff, loading, navigate]);

  if (!isStaff) return null;

  const total = shipments.length;
  const active = shipments.filter((s) => ACTIVE_STATUSES.includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("adminDashboard")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("brand")}</p>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <Stat icon={Package} label={t("totalShipments")} value={total} tint="bg-primary/10 text-primary" />
        <Stat icon={Users} label={t("totalCustomers")} value={customerCount} tint="bg-accent/20 text-accent-foreground" />
        <Stat icon={Truck} label={t("activeShipments")} value={active} tint="bg-warning/20 text-warning-foreground" />
        <Stat icon={CheckCircle} label={t("deliveredShipments")} value={delivered} tint="bg-success/20 text-success-foreground" />
      </section>

      <section className="px-5 mt-6 space-y-3">
        <NavCard to="/admin-add" icon={PlusCircle} title={t("addShipment")} />
        <NavCard to="/admin-customers" icon={Users} title={t("manageShipments")} />
        <NavCard to="/admin-shipments" icon={Package} title={t("allShipments")} />
        <NavCard to="/admin-notify" icon={Send} title={t("sendNotification")} />
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

function NavCard({ to, icon: Icon, title }: { to: string; icon: typeof Package; title: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </span>
      <span className="font-semibold text-sm">{title}</span>
    </Link>
  );
}
