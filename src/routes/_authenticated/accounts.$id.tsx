import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { fetchProfile, fetchUserRoles, updateProfile, type Profile, type AppRole, roleRank } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { resetUserPassword, deleteUserAccount, setUserRole } from "@/lib/staff.functions";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/accounts/$id")({
  head: () => ({ meta: [{ title: "Account — Almwanaa" }] }),
  component: AccountDetailPage,
});

function AccountDetailPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { role: callerRole, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>("customer");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = useServerFn(resetUserPassword);
  const remove = useServerFn(deleteUserAccount);
  const changeRole = useServerFn(setUserRole);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    Promise.all([fetchProfile(id), fetchUserRoles(id)]).then(([p, rs]) => {
      setProfile(p);
      const r: AppRole = rs.includes("admin") ? "admin"
        : rs.includes("manager") ? "manager"
        : rs.includes("employee") ? "employee" : "customer";
      setRole(r);
    }).catch(() => {});
  }, [id, isStaff, loading, navigate]);

  if (!isStaff || !profile) return <Layout><p className="p-6 text-sm text-muted-foreground">{t("loading")}</p></Layout>;

  const canEdit = roleRank(callerRole) > roleRank(role);

  const saveProfile = async () => {
    setBusy(true);
    try {
      await updateProfile(profile.id, {
        full_name: profile.full_name,
        phone: profile.phone,
        governorate: profile.governorate,
        area: profile.area,
      });
      toast.success(t("save"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  const onResetPassword = async () => {
    if (newPass.length < 6) { toast.error(t("password")); return; }
    setBusy(true);
    try {
      await reset({ data: { userId: profile.id, newPassword: newPass } });
      toast.success(t("save"));
      setNewPass("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await remove({ data: { userId: profile.id } });
      toast.success(t("delete"));
      navigate({ to: "/accounts" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  const onChangeRole = async (v: AppRole) => {
    setBusy(true);
    try {
      await changeRole({ data: { userId: profile.id, role: v } });
      setRole(v);
      toast.success(t("save"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("accountDetails")}</h1>
        {!canEdit && <p className="text-xs text-warning-foreground mt-1">{t("noPermission")}</p>}
      </section>

      <section className="px-5 space-y-3">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <Field label={t("fullName")} value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} disabled={!canEdit} />
          <Field label={t("phone")} value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} disabled={!canEdit} />
          <Field label={t("governorate")} value={profile.governorate ?? ""} onChange={(v) => setProfile({ ...profile, governorate: v })} disabled={!canEdit} />
          <Field label={t("area")} value={profile.area ?? ""} onChange={(v) => setProfile({ ...profile, area: v })} disabled={!canEdit} />
          <div>
            <label className="text-xs text-muted-foreground">{t("role")}</label>
            <Select value={role} onValueChange={(v) => onChangeRole(v as AppRole)} disabled={!canEdit || busy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">{t("customer")}</SelectItem>
                <SelectItem value="employee">{t("employee")}</SelectItem>
                <SelectItem value="manager">{t("manager")}</SelectItem>
                {callerRole === "admin" && <SelectItem value="admin">{t("admin")}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={saveProfile} disabled={!canEdit || busy}>{t("save")}</Button>
        </div>

        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2"><KeyRound className="w-4 h-4" /> {t("resetPassword")}</h2>
          <Input type="password" minLength={6} placeholder={t("newPassword")} value={newPass} onChange={(e) => setNewPass(e.target.value)} disabled={!canEdit} />
          <Button className="w-full" variant="outline" onClick={onResetPassword} disabled={!canEdit || busy}>{t("resetPassword")}</Button>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" variant="destructive" disabled={!canEdit || busy}>
                <Trash2 className="w-4 h-4 me-1" /> {t("deleteAccount")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deleteAccount")}</AlertDialogTitle>
                <AlertDialogDescription>{t("confirmDelete")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("confirm")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </Layout>
  );
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </div>
  );
}
