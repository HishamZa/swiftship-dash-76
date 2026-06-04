import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { store } from "@/lib/store";
import { Package } from "lucide-react";

export const Route = createFileRoute("/customer")({
  head: () => ({
    meta: [
      { title: "Customer Dashboard — SwiftCargo" },
      { name: "description", content: "View your shipments and account activity." },
    ],
  }),
  component: Customer,
});

function Customer() {
  const { t, lang } = useI18n();
  const all = store.getShipments();
  // Demo: show shipments for "Acme Co."
  const mine = all.filter((s) => s.customer === "Acme Co.");

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-accent/20 text-accent-foreground">
            <Package className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("customerTitle")}</h1>
            <div className="text-sm text-muted-foreground">Acme Co.</div>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold">{t("myShipments")}</h2>
        <div className="mt-4 rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-start p-3">{t("tracking")}</th>
                <th className="text-start p-3">{t("from")}</th>
                <th className="text-start p-3">{t("to")}</th>
                <th className="text-start p-3">{t("status")}</th>
                <th className="text-start p-3">{t("eta")}</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium">{s.id}</td>
                  <td className="p-3">{s.from}</td>
                  <td className="p-3">{s.to}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-accent/15 text-xs font-medium">{t(s.status)}</span>
                  </td>
                  <td className="p-3">{s.eta}</td>
                </tr>
              ))}
              {mine.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {lang === "ar" ? "لا توجد شحنات." : "No shipments."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
