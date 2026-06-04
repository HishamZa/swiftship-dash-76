import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement, type Announcement } from "@/lib/db";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/manage")({
  head: () => ({ meta: [{ title: "Manage — Almwanaa" }] }),
  component: ManagePage,
});

const empty = { title_en: "", title_ar: "", body_en: "", body_ar: "" };

function ManagePage() {
  const { t } = useI18n();
  const { isStaff, loading } = useAuth();
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = () => fetchAnnouncements(false).then(setAnns).catch(() => setAnns([]));
  useEffect(() => { if (isStaff) load(); }, [isStaff]);

  if (loading) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("loading")}</p></Layout>;
  if (!isStaff) return <Navigate to="/dashboard" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createAnnouncement({ ...form, title_ar: form.title_ar || null, body_en: form.body_en || null, body_ar: form.body_ar || null, published: true });
      toast.success("Posted");
      setForm(empty);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await deleteAnnouncement(id);
    load();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("nav_manage")}</h1>
      </section>

      <section className="px-5 space-y-4">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">{t("newAnnouncement")}</h2>
          <Input required placeholder={t("title_en")} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
          <Input placeholder={t("title_ar")} dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} />
          <Textarea placeholder={t("body_en")} value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} />
          <Textarea placeholder={t("body_ar")} dir="rtl" value={form.body_ar} onChange={(e) => setForm({ ...form, body_ar: e.target.value })} />
          <Button type="submit" disabled={busy} className="w-full"><Plus className="w-4 h-4 me-1" />{t("save")}</Button>
        </form>

        <div className="space-y-2">
          {anns.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-card p-4 flex justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{a.title_en}</p>
                {a.title_ar && <p className="text-xs text-muted-foreground" dir="rtl">{a.title_ar}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
