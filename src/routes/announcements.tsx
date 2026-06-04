import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { store } from "@/lib/store";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — SwiftCargo" },
      { name: "description", content: "Latest news, route updates, and service announcements from SwiftCargo." },
    ],
  }),
  component: Announcements,
});

function Announcements() {
  const { t, lang } = useI18n();
  const anns = store.getAnnouncements();

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-accent" />
          {t("announcementsTitle")}
        </h1>
        <div className="mt-8 space-y-4">
          {anns.map((a) => (
            <article key={a.id} className="rounded-2xl border bg-card p-6">
              <div className="text-xs text-muted-foreground">{a.at}</div>
              <h2 className="text-xl font-semibold mt-1">{lang === "ar" ? a.title_ar : a.title_en}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {lang === "ar" ? a.body_ar : a.body_en}
              </p>
            </article>
          ))}
          {anns.length === 0 && (
            <p className="text-muted-foreground">—</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
