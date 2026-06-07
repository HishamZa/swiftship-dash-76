import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { fetchAllAddresses, createAddress, deleteAddress, type AddressEntry } from "@/lib/db";
import { Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/offices-manage")({
  head: () => ({ meta: [{ title: "Offices Management — Almwanaa" }] }),
  component: OfficesManagePage,
});

const emptyOffice = { name: "", phone: "", country: "", city: "", address: "", notes: "" };
const emptyAddress = { name: "", address: "" };

function OfficesManagePage() {
  const { t } = useI18n();
  const { isStaff, isManager, loading, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [openOffice, setOpenOffice] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [officeForm, setOfficeForm] = useState(emptyOffice);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  const load = () => fetchAllAddresses().then(setItems).catch(() => setItems([]));

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    load();
  }, [isStaff, loading, navigate]);

  if (!isStaff) return null;

  const submitOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createAddress({
        name: officeForm.name,
        user_id: user.id,
        phone: officeForm.phone || null,
        country: officeForm.country || null,
        city: officeForm.city || null,
        address: officeForm.address || null,
        notes: officeForm.notes || null,
        entry_type: "office",
      });
      toast.success(t("save"));
      setOfficeForm(emptyOffice); setOpenOffice(false); load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createAddress({
        name: addressForm.name,
        user_id: user.id,
        phone: null,
        country: null,
        city: null,
        address: addressForm.address || null,
        notes: null,
        entry_type: "address",
      });
      toast.success(t("save"));
      setAddressForm(emptyAddress); setOpenAddress(false); load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const remove = async (id: string) => {
    await deleteAddress(id); load();
  };

  const offices = items.filter((i) => i.entry_type === "office");
  const addresses = items.filter((i) => i.entry_type === "address");

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">{t("officesManagement")}</h1>
        {isManager ? (
          <div className="flex gap-2 flex-wrap">
            <Dialog open={openOffice} onOpenChange={setOpenOffice}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 me-1" /> {t("addOffice")}</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{t("addOffice")}</DialogTitle></DialogHeader>
                <form onSubmit={submitOffice} className="space-y-2">
                  <Input required placeholder={t("name")} value={officeForm.name} onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })} />
                  <Input placeholder={t("phone")} value={officeForm.phone} onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder={t("country")} value={officeForm.country} onChange={(e) => setOfficeForm({ ...officeForm, country: e.target.value })} />
                    <Input placeholder={t("city")} value={officeForm.city} onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })} />
                  </div>
                  <Input placeholder={t("address")} value={officeForm.address} onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })} />
                  <Textarea placeholder={t("notes")} value={officeForm.notes} onChange={(e) => setOfficeForm({ ...officeForm, notes: e.target.value })} />
                  <Button type="submit" className="w-full">{t("save")}</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={openAddress} onOpenChange={setOpenAddress}>
              <DialogTrigger asChild><Button size="sm" variant="secondary"><Plus className="w-4 h-4 me-1" /> {t("addAddress")}</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{t("addAddress")}</DialogTitle></DialogHeader>
                <form onSubmit={submitAddress} className="space-y-2">
                  <Input required placeholder={t("addressName")} value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} />
                  <Textarea required rows={5} placeholder={t("addressDetails")} value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} />
                  <Button type="submit" className="w-full">{t("save")}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("viewOnly")}</span>
        )}
      </section>

      <section className="px-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">{t("offices")}</h2>
          <div className="space-y-2">
            {offices.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
            {offices.map((a) => (
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
                    <DeleteBtn onConfirm={() => remove(a.id)} title={t("deleteOffice")} desc={t("confirmDeleteItem")} cancel={t("cancel")} confirm={t("confirm")} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">{t("addressBook")}</h2>
          <div className="space-y-2">
            {addresses.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
            {addresses.map((a) => (
              <div key={a.id} className="rounded-2xl border bg-card p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{a.name}</p>
                    {a.address && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{a.address}</p>}
                  </div>
                  {isManager && (
                    <DeleteBtn onConfirm={() => remove(a.id)} title={t("deleteAddress")} desc={t("confirmDeleteItem")} cancel={t("cancel")} confirm={t("confirm")} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function DeleteBtn({ onConfirm, title, desc, cancel, confirm }: { onConfirm: () => void; title: string; desc: string; cancel: string; confirm: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{confirm}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
