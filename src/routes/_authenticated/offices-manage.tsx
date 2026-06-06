import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchAllAddresses, createAddress, deleteAddress, type AddressEntry } from "@/lib/db";
import { Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/offices-manage")({
  head: () => ({ meta: [{ title: "Offices Management — Almwanaa" }] }),
  component: OfficesManagePage,
});

const empty = { name: "", phone: "", country: "", city: "", address: "", notes: "" };

function OfficesManagePage() {
  const { t } = useI18n();
  const { isStaff, isManager, loading, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => fetchAllAddresses().then(setItems).catch(() => setItems([]));

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    load();
  }, [isStaff, loading, navigate]);

  if (!isStaff) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createAddress({
        ...form,
        user_id: user.id,
        phone: form.phone || null,
        country: form.country || null,
        city: form.city || null,
        address: form.address || null,
        notes: form.notes || null,
      });
      toast.success(t("save"));
      setForm(empty); setOpen(false); load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await deleteAddress(id); load();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("officesManagement")}</h1>
        {isManager ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 me-1" /> {t("addOffice")}</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{t("addOffice")}</DialogTitle></DialogHeader>
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
        ) : (
          <span className="text-xs text-muted-foreground">{t("viewOnly")}</span>
        )}
      </section>

      <section className="px-5 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-semibold">{a.name}</p>
                {a.phone && <p className="text-xs text-muted-foreground">{a.phone}</p>}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {[a.address, a.city, a.country].filter(Boolean).join(", ")}
                </p>
                {a.notes && <p className="text-xs mt-1">{a.notes}</p>}
              </div>
              {isManager && (
                <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              )}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
