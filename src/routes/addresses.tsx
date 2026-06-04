import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { offices } from "@/lib/store";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/addresses")({
  head: () => ({
    meta: [
      { title: "Our Offices — SwiftCargo" },
      { name: "description", content: "SwiftCargo office locations and contact details worldwide." },
    ],
  }),
  component: Addresses,
});

function Addresses() {
  const { t, lang } = useI18n();
  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold">{t("addressesTitle")}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {lang === "ar" ? "تواصل مع أقرب مكتب لك." : "Get in touch with the team nearest you."}
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offices.map((o) => (
            <div key={o.city_en} className="rounded-2xl border bg-card p-6 hover:border-accent transition">
              <div className="text-sm text-muted-foreground">{lang === "ar" ? o.country_ar : o.country_en}</div>
              <div className="text-xl font-bold mt-1">{lang === "ar" ? o.city_ar : o.city_en}</div>
              <div className="mt-4 flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{lang === "ar" ? o.addr_ar : o.addr_en}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-accent" />
                <a href={`tel:${o.phone}`} className="hover:underline" dir="ltr">{o.phone}</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
