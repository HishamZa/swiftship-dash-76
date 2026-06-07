import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { fetchAllAddresses, type AddressEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Address Book — Almwanaa" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAddresses()
      .then((all) => setItems(all.filter((a) => a.entry_type === "address")))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const copyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("addressCopied"));
    } catch {
      toast.error("Error");
    }
  };

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
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.name}</p>
                {a.address && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{a.address}</p>
                )}
              </div>
              {a.address && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyAddress(a.address!)}
                  aria-label={t("copy")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
