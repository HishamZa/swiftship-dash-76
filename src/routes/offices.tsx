import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { offices } from "@/lib/store";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Offices — Almwanaa" }] }),
  component: OfficesPage,
});

function OfficesPage() {
  const { t, lang } = useI18n();
  return (
    <Layout>
      <section className="px-5 py-6">
        <h1 className="text-xl font-bold mb-4">{t("offices")}</h1>
        <div className="space-y-3">
          {offices.map((o) => (
            <div key={o.city_en} className="rounded-2xl border bg-card p-4">
              <h2 className="font-semibold">{lang === "ar" ? o.city_ar : o.city_en}, {lang === "ar" ? o.country_ar : o.country_en}</h2>
              <p className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {lang === "ar" ? o.addr_ar : o.addr_en}
              </p>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> {o.phone}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
