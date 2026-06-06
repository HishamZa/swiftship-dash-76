import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, type Announcement } from "@/lib/db";
import { Plus, Trash2, Lock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/news-manage")({
  head: () => ({ meta: [{ title: "News Management — Almwanaa" }] }),
  component: NewsManagePage,
});

const empty = { title_en: "", title_ar: "", body_en: "", body_ar: "", published: true };

function NewsManagePage() {
  const { t } = useI18n();
  const { isManager, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = () => fetchAnnouncements(false).then(setAnns).catch(() => setAnns([]));

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    if (isManager) load();
  }, [isStaff, isManager, loading, navigate]);

  if (!isStaff) return null;
  if (!isManager) {
    return (
      <Layout>
        <section className="px-5 py-16 text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-muted mb-3">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold">{t("adminsOnly")}</h1>
        </section>
      </Layout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createAnnouncement({
        title_en: form.title_en,
        title_ar: form.title_ar || null,
        body_en: form.body_en || null,
        body_ar: form.body_ar || null,
        published: form.published,
      });
      toast.success(t("save"));
      setForm(empty);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  const togglePublished = async (a: Announcement) => {
    await updateAnnouncement(a.id, { published: !a.published });
    load();
  };

  const remove = async (id: string) => {
    await deleteAnnouncement(id);
    load();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("newsManagement")}</h1>
      </section>

      <section className="px-5 space-y-4">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm">{t("newAnnouncement")}</h2>
          <Input required placeholder={t("title_en")} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
          <Input placeholder={t("title_ar")} dir="rtl" value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} />
          <Textarea placeholder={t("body_en")} value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} />
          <Textarea placeholder={t("body_ar")} dir="rtl" value={form.body_ar} onChange={(e) => setForm({ ...form, body_ar: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            {t("published")}
          </label>
          <Button type="submit" disabled={busy} className="w-full"><Plus className="w-4 h-4 me-1" />{t("save")}</Button>
        </form>

        <div className="space-y-2">
          {anns.map((a) => (
            <div key={a.id} className="rounded-2xl border bg-card p-4 flex justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{a.title_en}</p>
                {a.title_ar && <p className="text-xs text-muted-foreground" dir="rtl">{a.title_ar}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(a.created_at).toLocaleDateString()} · {a.published ? t("published") : t("cancel")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Switch checked={a.published} onCheckedChange={() => togglePublished(a)} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteNews")}</AlertDialogTitle>
                      <AlertDialogDescription>{t("confirmDeleteItem")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("confirm")}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
