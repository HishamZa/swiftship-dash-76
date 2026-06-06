import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchAllAddresses, type AddressEntry } from "@/lib/db";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Offices — Almwanaa" }] }),
  component: OfficesPage,
});

function OfficesPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAddresses().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="px-5 py-6">
        <h1 className="text-xl font-bold mb-4">{t("offices")}</h1>
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-card p-4">
              <h2 className="font-semibold">{o.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {[o.address, o.city, o.country].filter(Boolean).join(", ") || "—"}
              </p>
              {o.phone && (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {o.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
