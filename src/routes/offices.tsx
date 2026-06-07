import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchAllAddresses, type AddressEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Offices — Almwanaa" }] }),
  component: OfficesPage,
});

function OfficesPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAddresses()
      .then((all) => setItems(all.filter((a) => a.entry_type === "office")))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success(t("phoneCopied"));
    } catch {
      toast.error("Error");
    }
  };

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
                <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{o.phone}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyPhone(o.phone!)}
                    aria-label={t("copy")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
