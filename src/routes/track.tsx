import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { store, type Shipment, type ShipmentStatus } from "@/lib/store";
import { CheckCircle2, Circle, MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Shipment — SwiftCargo" },
      { name: "description", content: "Enter your tracking number to see real-time shipment status." },
    ],
  }),
  component: Track,
});

const order: ShipmentStatus[] = ["st_created", "st_picked", "st_transit", "st_outfd", "st_delivered"];

function Track() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [result, setResult] = useState<Shipment | null | "miss">(null);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const s = store.getShipments().find((x) => x.id.toLowerCase() === q.trim().toLowerCase());
    setResult(s ?? "miss");
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold">{t("trackTitle")}</h1>
        <form onSubmit={onSearch} className="mt-6 flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("trackPlaceholder")} className="h-12 text-base" />
          <Button type="submit" size="lg">
            <Search className="w-4 h-4 me-2" />
            {t("trackBtn")}
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">Try: SC1001, SC1002</p>

        {result === "miss" && (
          <div className="mt-8 rounded-xl border bg-destructive/10 text-destructive-foreground p-4">
            <span className="text-destructive font-medium">{t("notFound")}</span>
          </div>
        )}

        {result && result !== "miss" && (
          <div className="mt-8 rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{t("tracking")}</div>
                <div className="text-xl font-bold">{result.id}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
                {t(result.status)}
              </span>
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t("from")}</div>
                <div className="font-medium flex items-center gap-1 mt-1"><MapPin className="w-4 h-4 text-accent" />{result.from}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("to")}</div>
                <div className="font-medium flex items-center gap-1 mt-1"><MapPin className="w-4 h-4 text-accent" />{result.to}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t("eta")}</div>
                <div className="font-medium mt-1">{result.eta}</div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-3">{t("history")}</h3>
              <ol className="relative ms-3 border-s">
                {order.map((s) => {
                  const entry = result.history.find((h) => h.status === s);
                  const done = !!entry;
                  return (
                    <li key={s} className="ms-4 pb-4">
                      <span className="absolute -start-[9px] mt-1">
                        {done ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                      </span>
                      <div className={done ? "font-medium" : "text-muted-foreground"}>{t(s)}</div>
                      {entry && <div className="text-xs text-muted-foreground">{entry.at}</div>}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
