import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { store } from "@/lib/store";
import { Ship, Plane, Truck, Package, ArrowRight, Megaphone } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwiftCargo — Global Shipping & Logistics" },
      { name: "description", content: "Track shipments and manage logistics worldwide with SwiftCargo." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const anns = store.getAnnouncements().slice(0, 2);

  const services = [
    { icon: Ship, en: "Sea Freight", ar: "الشحن البحري", desc_en: "Full and partial container loads worldwide.", desc_ar: "حاويات كاملة وجزئية حول العالم." },
    { icon: Plane, en: "Air Cargo", ar: "الشحن الجوي", desc_en: "Priority air services with door-to-door tracking.", desc_ar: "خدمات جوية ذات أولوية مع تتبع شامل." },
    { icon: Truck, en: "Land Transport", ar: "النقل البري", desc_en: "Cross-border trucking and last-mile delivery.", desc_ar: "نقل بري عابر للحدود وتوصيل الميل الأخير." },
    { icon: Package, en: "Warehousing", ar: "التخزين", desc_en: "Secure storage and fulfillment hubs in 40 cities.", desc_ar: "تخزين آمن ومراكز توزيع في 40 مدينة." },
  ];

  return (
    <Layout>
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-widest text-xs opacity-80 mb-3">{t("tagline")}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              <span className="text-gradient">{t("heroTitle")}</span>
            </h1>
            <p className="mt-5 text-lg opacity-90 max-w-lg">{t("heroSub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/track">
                  {t("trackCta")} <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10">
                <Link to="/addresses">{t("learnMore")}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.en} className="rounded-2xl bg-primary-foreground/10 backdrop-blur p-5 border border-primary-foreground/20">
                <s.icon className="w-7 h-7 mb-3" />
                <div className="font-semibold">{lang === "ar" ? s.ar : s.en}</div>
                <p className="text-sm opacity-80 mt-1">{lang === "ar" ? s.desc_ar : s.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-4">
          {services.map((s) => (
            <div key={s.en} className="md:hidden rounded-2xl bg-card p-5 border">
              <s.icon className="w-7 h-7 text-accent mb-3" />
              <div className="font-semibold">{lang === "ar" ? s.ar : s.en}</div>
              <p className="text-sm text-muted-foreground mt-1">{lang === "ar" ? s.desc_ar : s.desc_en}</p>
            </div>
          ))}
        </div>

        {anns.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-accent" /> {t("announcementsTitle")}
              </h2>
              <Link to="/announcements" className="text-sm font-medium text-primary hover:underline">
                {t("learnMore")} →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {anns.map((a) => (
                <div key={a.id} className="rounded-xl border bg-card p-5">
                  <div className="text-xs text-muted-foreground">{a.at}</div>
                  <div className="font-semibold mt-1">{lang === "ar" ? a.title_ar : a.title_en}</div>
                  <p className="text-sm text-muted-foreground mt-2">{lang === "ar" ? a.body_ar : a.body_en}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
