import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchAddresses, createAddress, deleteAddress, type AddressEntry } from "@/lib/db";
import { Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Address Book — Almwanaa" }] }),
  component: AddressesPage,
});

const empty = { name: "", phone: "", country: "", city: "", address: "", notes: "" };

function AddressesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try { setItems(await fetchAddresses(user.id)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createAddress({ ...form, user_id: user.id, phone: form.phone || null, country: form.country || null, city: form.city || null, address: form.address || null, notes: form.notes || null });
      toast.success("Saved");
      setForm(empty); setOpen(false); load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await deleteAddress(id); load();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("addressBook")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4" /></Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{t("add")}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-2">
              <Input required placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder={t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={t("country")} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                <Input placeholder={t("city")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <Input placeholder={t("address")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <Button type="submit" className="w-full">{t("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="px-5 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold">{a.name}</p>
                {a.phone && <p className="text-xs text-muted-foreground">{a.phone}</p>}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {[a.address, a.city, a.country].filter(Boolean).join(", ")}
                </p>
                {a.notes && <p className="text-xs mt-1">{a.notes}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
