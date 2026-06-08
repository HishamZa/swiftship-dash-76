import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProfile, type Profile } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { updateMyAccount, changeMyPassword } from "@/lib/staff.functions";
import { toast } from "sonner";
import { KeyRound, UserCog } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Account Settings — Almwanaa" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const { user, isStaff } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [area, setArea] = useState("");
  const [username, setUsername] = useState("");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);

  const update = useServerFn(updateMyAccount);
  const changePw = useServerFn(changeMyPassword);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((p) => {
      setProfile(p);
      setFullName(p?.full_name ?? "");
      setPhone(p?.phone ?? "");
      setGovernorate(p?.governorate ?? "");
      setArea(p?.area ?? "");
      const meta = user.user_metadata as { username?: string } | undefined;
      setUsername(meta?.username ?? "");
    }).catch(() => {});
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await update({
        data: isStaff
          ? { full_name: fullName, phone, username: username || undefined }
          : { full_name: fullName, phone, governorate, area },
      });
      toast.success(t("saved"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) { toast.error(t("password")); return; }
    setBusy(true);
    try {
      await changePw({ data: { newPassword: newPass } });
      toast.success(t("passwordUpdated"));
      setNewPass("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  if (!profile) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("loading")}</p></Layout>;

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2"><UserCog className="w-5 h-5" /> {t("accountSettings")}</h1>
      </section>

      <section className="px-5 space-y-3">
        <form onSubmit={saveProfile} className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">{t("fullName")}</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={1} maxLength={120} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("phone")}</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
          </div>

          {isStaff && (
            <div>
              <label className="text-xs text-muted-foreground">{t("username")}</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} minLength={2} maxLength={60} />
            </div>
          )}

          {!isStaff && (
            <>
              <div>
                <label className="text-xs text-muted-foreground">{t("governorate")}</label>
                <Input value={governorate} onChange={(e) => setGovernorate(e.target.value)} maxLength={80} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("area")}</label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} maxLength={120} />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={busy}>{t("save")}</Button>
        </form>

        <form onSubmit={submitPassword} className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4" /> {t("changePassword")}</h2>
          <Input type="password" minLength={6} placeholder={t("newPassword")} value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
          <Button type="submit" variant="outline" className="w-full" disabled={busy}>{t("updatePassword")}</Button>
        </form>
      </section>
    </Layout>
  );
}
