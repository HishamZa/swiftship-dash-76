import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchAllAddresses, type AddressEntry } from "@/lib/db";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Address Book — Almwanaa" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAddresses().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("addressBook")}</h1>
      </section>

      <section className="px-5 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4">
            <p className="font-semibold">{a.name}</p>
            {a.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> {a.phone}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {[a.address, a.city, a.country].filter(Boolean).join(", ") || "—"}
            </p>
            {a.notes && <p className="text-xs mt-1">{a.notes}</p>}
          </div>
        ))}
      </section>
    </Layout>
  );
}
