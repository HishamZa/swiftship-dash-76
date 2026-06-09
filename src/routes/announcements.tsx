import { formatDate } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchAnnouncements, type Announcement } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { markNewsSeen } from "@/lib/unreadNews";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "News — Almwanaa" }] }),
  component: NewsPage,
});

function NewsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements(true)
      .then((list) => {
        setItems(list);
        if (user) markNewsSeen(user.id);
        // Increment view counter for each visible announcement (once per page load).
        for (const a of list) {
          supabase.rpc("increment_announcement_views", { p_id: a.id }).then(() => {}, () => {});
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Layout>
      <section className="px-5 py-6">
        <h1 className="flex items-center gap-2 text-xl font-bold mb-4">
          <Megaphone className="w-5 h-5 text-accent" /> {t("news")}
        </h1>
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-3">
          {items.map((a) => (
            <article key={a.id} className="rounded-2xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
              <h2 className="font-semibold mt-1">{lang === "ar" && a.title_ar ? a.title_ar : a.title_en}</h2>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{lang === "ar" && a.body_ar ? a.body_ar : a.body_en}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
