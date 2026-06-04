import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { store, type Shipment, type Announcement, type ShipmentStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SwiftCargo" },
      { name: "description", content: "Manage shipments and post announcements." },
    ],
  }),
  component: Admin,
});

const statuses: ShipmentStatus[] = ["st_created", "st_picked", "st_transit", "st_outfd", "st_delivered"];

function Admin() {
  const { t, lang } = useI18n();
  const [shipments, setShipments] = useState<Shipment[]>(() => store.getShipments());
  const [anns, setAnns] = useState<Announcement[]>(() => store.getAnnouncements());

  const [ns, setNs] = useState({ id: "", customer: "", from: "", to: "", eta: "" });
  const [na, setNa] = useState({ title_en: "", title_ar: "", body_en: "", body_ar: "" });

  const saveShipments = (next: Shipment[]) => { setShipments(next); store.setShipments(next); };
  const saveAnns = (next: Announcement[]) => { setAnns(next); store.setAnnouncements(next); };

  const addShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ns.id || !ns.customer) return;
    const today = new Date().toISOString().slice(0, 10);
    const sh: Shipment = {
      id: ns.id, customer: ns.customer, from: ns.from, to: ns.to, eta: ns.eta || today,
      status: "st_created",
      history: [{ status: "st_created", at: today }],
    };
    saveShipments([sh, ...shipments]);
    setNs({ id: "", customer: "", from: "", to: "", eta: "" });
    toast.success(lang === "ar" ? "تمت الإضافة" : "Shipment added");
  };

  const updateStatus = (id: string, status: ShipmentStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    saveShipments(shipments.map((s) => s.id === id
      ? { ...s, status, history: s.history.some(h => h.status === status) ? s.history : [...s.history, { status, at: today }] }
      : s));
  };

  const delShipment = (id: string) => saveShipments(shipments.filter((s) => s.id !== id));

  const addAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!na.title_en && !na.title_ar) return;
    const a: Announcement = { id: crypto.randomUUID(), ...na, at: new Date().toISOString().slice(0, 10) };
    saveAnns([a, ...anns]);
    setNa({ title_en: "", title_ar: "", body_en: "", body_ar: "" });
    toast.success(lang === "ar" ? "تم النشر" : "Posted");
  };

  const delAnn = (id: string) => saveAnns(anns.filter((a) => a.id !== id));

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary text-primary-foreground">
            <Shield className="w-5 h-5" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">{t("adminTitle")}</h1>
        </div>

        <Tabs defaultValue="ship">
          <TabsList>
            <TabsTrigger value="ship">{t("allShipments")}</TabsTrigger>
            <TabsTrigger value="ann">{t("announcementsTitle")}</TabsTrigger>
          </TabsList>

          <TabsContent value="ship" className="mt-6 space-y-6">
            <form onSubmit={addShipment} className="rounded-2xl border bg-card p-5 grid sm:grid-cols-2 md:grid-cols-5 gap-3">
              <Input placeholder={t("tracking")} value={ns.id} onChange={(e) => setNs({ ...ns, id: e.target.value })} />
              <Input placeholder={t("customer")} value={ns.customer} onChange={(e) => setNs({ ...ns, customer: e.target.value })} />
              <Input placeholder={t("from")} value={ns.from} onChange={(e) => setNs({ ...ns, from: e.target.value })} />
              <Input placeholder={t("to")} value={ns.to} onChange={(e) => setNs({ ...ns, to: e.target.value })} />
              <div className="flex gap-2">
                <Input type="date" value={ns.eta} onChange={(e) => setNs({ ...ns, eta: e.target.value })} />
                <Button type="submit"><Plus className="w-4 h-4" /></Button>
              </div>
            </form>

            <div className="rounded-2xl border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="text-start p-3">{t("tracking")}</th>
                    <th className="text-start p-3">{t("customer")}</th>
                    <th className="text-start p-3">{t("from")}</th>
                    <th className="text-start p-3">{t("to")}</th>
                    <th className="text-start p-3">{t("status")}</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 font-medium">{s.id}</td>
                      <td className="p-3">{s.customer}</td>
                      <td className="p-3">{s.from}</td>
                      <td className="p-3">{s.to}</td>
                      <td className="p-3 min-w-[170px]">
                        <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as ShipmentStatus)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statuses.map((st) => <SelectItem key={st} value={st}>{t(st)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-end">
                        <Button variant="ghost" size="icon" onClick={() => delShipment(s.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="ann" className="mt-6 space-y-6">
            <form onSubmit={addAnn} className="rounded-2xl border bg-card p-5 grid md:grid-cols-2 gap-3">
              <Input placeholder="Title (EN)" value={na.title_en} onChange={(e) => setNa({ ...na, title_en: e.target.value })} />
              <Input placeholder="العنوان (AR)" dir="rtl" value={na.title_ar} onChange={(e) => setNa({ ...na, title_ar: e.target.value })} />
              <Textarea placeholder="Body (EN)" value={na.body_en} onChange={(e) => setNa({ ...na, body_en: e.target.value })} />
              <Textarea placeholder="المحتوى (AR)" dir="rtl" value={na.body_ar} onChange={(e) => setNa({ ...na, body_ar: e.target.value })} />
              <div className="md:col-span-2">
                <Button type="submit"><Plus className="w-4 h-4 me-2" />{t("addAnnouncement")}</Button>
              </div>
            </form>

            <div className="space-y-3">
              {anns.map((a) => (
                <div key={a.id} className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">{a.at}</div>
                    <div className="font-semibold mt-1">{a.title_en} <span className="text-muted-foreground">/ {a.title_ar}</span></div>
                    <p className="text-sm text-muted-foreground mt-1">{a.body_en}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => delAnn(a.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}
