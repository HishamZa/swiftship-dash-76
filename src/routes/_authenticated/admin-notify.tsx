import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fetchCustomers, fetchAllUserRoles, broadcastNotification, sendNotificationToUser, type Profile } from "@/lib/db";
import { toast } from "sonner";
import { Send, Lock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin-notify")({
  head: () => ({ meta: [{ title: "Send Notification — Almwanaa" }] }),
  component: AdminNotifyPage,
});

function AdminNotifyPage() {
  const { t } = useI18n();
  const { isStaff, isManager, loading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [mode, setMode] = useState<"all" | "one">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    if (!isManager) return;
    fetchCustomers().then(setCustomers).catch(() => setCustomers([]));
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

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      if (mode === "all") {
        const n = await broadcastNotification(title.trim(), body.trim());
        toast.success(`${t("sent")} (${n})`);
      } else {
        if (!userId) { toast.error(t("selectCustomer")); setBusy(false); return; }
        await sendNotificationToUser(userId, title.trim(), body.trim());
        toast.success(t("sent"));
      }
      setTitle(""); setBody("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("sendNotification")}</h1>
      </section>
      <section className="px-5">
        <form onSubmit={send} className="rounded-2xl border bg-card p-4 space-y-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "all" | "one")} className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="all" id="m-all" />
              <Label htmlFor="m-all" className="text-sm">{t("toAll")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="one" id="m-one" />
              <Label htmlFor="m-one" className="text-sm">{t("toSpecific")}</Label>
            </div>
          </RadioGroup>

          {mode === "one" && (
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder={t("selectCustomer")} /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {(c.full_name ?? "—")}{c.phone ? ` · ${c.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div>
            <label className="text-xs text-muted-foreground">{t("title")}</label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("message")}</label>
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            <Send className="w-4 h-4 me-1" /> {t("send")}
          </Button>
        </form>
      </section>
    </Layout>
  );
}
