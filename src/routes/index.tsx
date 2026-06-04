import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Anchor, Search, MapPin, Bell, Package } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Almwanaa — Shipment Tracking" },
      { name: "description", content: "Track shipments and manage logistics in one place." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/track", search: { q: q.trim() } });
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground px-5 pt-8 pb-10 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary-foreground/15 backdrop-blur">
            <Anchor className="w-6 h-6" />
          </span>
          <div>
            <p className="text-xs opacity-80">{t("welcome")}</p>
            <h1 className="text-xl font-bold">{t("brand")}</h1>
          </div>
        </div>
        <h2 className="text-2xl font-bold leading-tight">{t("heroTitle")}</h2>
        <p className="mt-2 text-sm opacity-90">{t("heroSub")}</p>

        <form onSubmit={onTrack} className="mt-5 flex gap-2 bg-card text-foreground p-2 rounded-2xl shadow-lg">
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("trackPlaceholder")}
              className="border-0 shadow-none focus-visible:ring-0 px-0"
            />
          </div>
          <Button type="submit" size="sm">{t("trackBtn")}</Button>
        </form>
      </section>

      <section className="px-5 py-6 grid grid-cols-2 gap-3">
        <QuickTile to="/track" icon={Search} label={t("nav_track")} />
        <QuickTile to="/announcements" icon={Bell} label={t("nav_news")} />
        <QuickTile to="/dashboard" icon={Package} label={t("nav_dashboard")} />
        <QuickTile to="/offices" icon={MapPin} label={t("offices")} />
      </section>

      <p className="text-center text-xs text-muted-foreground px-4 pb-6">{t("footer")}</p>
    </Layout>
  );
}

function QuickTile({ to, icon: Icon, label }: { to: string; icon: typeof Search; label: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-card border p-4 flex flex-col gap-2 hover:shadow-md transition">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
