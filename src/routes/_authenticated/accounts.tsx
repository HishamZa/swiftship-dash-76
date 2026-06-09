import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchCustomers, fetchAllUserRoles, type Profile, type AppRole } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { createStaffAccount, deleteUserAccount, resetUserPassword } from "@/lib/staff.functions";
import { toast } from "sonner";
import { Plus, Search, UserCircle2, ShieldCheck, Trash2, Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Almwanaa" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  const { t } = useI18n();
  const { user, role: callerRole, isStaff, isManager, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, AppRole[]>>({});
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const removeFn = useServerFn(deleteUserAccount);

  const load = async () => {
    // Search only filters the customer list. Always fetch the full set so
    // admin/manager/employee sections stay complete regardless of the query.
    const [p, r] = await Promise.all([fetchCustomers(), fetchAllUserRoles()]);
    setProfiles(p); setRolesMap(r);
  };

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    load().catch(() => {});
    // eslint-disable-next-line
  }, [isStaff, loading, navigate]);

  const enriched = useMemo(() => profiles.map((p) => {
    const rs = rolesMap[p.id] ?? [];
    const r: AppRole = rs.includes("admin") ? "admin"
      : rs.includes("manager") ? "manager"
      : rs.includes("employee") ? "employee" : "customer";
    return { ...p, role: r };
  }), [profiles, rolesMap]);

  const admins = enriched.filter((p) => p.role === "admin" && callerRole === "admin");
  const managers = enriched.filter((p) => p.role === "manager");
  const employees = enriched.filter((p) => p.role === "employee");
  const customers = useMemo(() => {
    const all = enriched.filter((p) => p.role === "customer");
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => {
      const name = (p.full_name ?? "").toLowerCase();
      const phone = (p.phone ?? "").toLowerCase();
      const gov = (p.governorate ?? "").toLowerCase();
      const area = (p.area ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || gov.includes(q) || area.includes(q);
    });
  }, [enriched, search]);

  const canDelete = (target: AppRole, targetId: string) => {
    if (targetId === user?.id) return false;
    if (callerRole === "admin") return true;
    if (callerRole === "manager") {
      // Managers can delete customers, employees, and other managers (not self, not admin)
      return target === "customer" || target === "employee" || target === "manager";
    }
    // Employees cannot delete any account
    return false;
  };

  const canReset = (target: AppRole, targetId: string) => {
    if (targetId === user?.id) return false;
    if (callerRole === "admin") return true;
    if (callerRole === "manager") return target !== "admin";
    if (callerRole === "employee") return target === "customer";
    return false;
  };

  const onDelete = async (id: string) => {
    try {
      await removeFn({ data: { userId: id } });
      toast.success(t("delete"));
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  if (!isStaff) return null;

  const Section = ({ title, icon: Icon, list }: { title: string; icon: typeof ShieldCheck; list: (Profile & { role: AppRole })[] }) => (
    <>
      <h2 className="font-semibold text-sm mb-2 mt-4 flex items-center gap-2"><Icon className="w-4 h-4" /> {title}</h2>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-xs text-muted-foreground">{t("empty")}</p>}
        {list.map((p) => (
          <AccountRow key={p.id} p={p} canDelete={canDelete(p.role, p.id)} canReset={canReset(p.role, p.id)} onDelete={() => onDelete(p.id)} />
        ))}
      </div>
    </>
  );

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("accounts")}</h1>
        {isManager && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 me-1" /> {t("addEmployee")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{t("newStaff")}</DialogTitle></DialogHeader>
              <NewStaffForm onCreated={() => { setOpen(false); load(); }} />
            </DialogContent>
          </Dialog>
        )}
      </section>

      <section className="px-5">
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 mb-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="border-0 shadow-none focus-visible:ring-0 px-0 h-9" />
        </div>

        <div className="rounded-2xl border bg-muted/30 p-3 mb-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{t("staff")}</p>
          {callerRole === "admin" && <Section title={t("admin")} icon={ShieldCheck} list={admins} />}
          <Section title={t("manager")} icon={ShieldCheck} list={managers} />
          <Section title={t("employee")} icon={ShieldCheck} list={employees} />
        </div>

        <h2 className="font-semibold text-sm mb-2 mt-4 flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> {t("customers")}</h2>
        <div className="space-y-2">
          {customers.length === 0 && <p className="text-xs text-muted-foreground">{t("empty")}</p>}
          {customers.map((p) => (
            <AccountRow key={p.id} p={p} canDelete={canDelete(p.role, p.id)} canReset={canReset(p.role, p.id)} onDelete={() => onDelete(p.id)} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

function AccountRow({ p, canDelete, canReset, onDelete }: { p: Profile & { role: AppRole }; canDelete: boolean; canReset: boolean; onDelete: () => void }) {
  const { t } = useI18n();
  const tint =
    p.role === "admin" ? "bg-destructive/10 text-destructive"
    : p.role === "manager" ? "bg-warning/20 text-warning-foreground"
    : p.role === "employee" ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
  return (
    <div className="block rounded-2xl border bg-card p-4">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{p.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{p.phone ?? "—"}{p.governorate ? ` · ${p.governorate}` : ""}{p.area ? ` / ${p.area}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${tint}`}>{t(p.role)}</span>
          {canReset && <ResetPasswordButton userId={p.id} />}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
          )}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordButton({ userId }: { userId: string }) {
  const { t, lang } = useI18n();
  const reset = useServerFn(resetUserPassword);
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error(lang === "ar" ? "كلمة المرور قصيرة جداً (6 أحرف على الأقل)" : "Password must be at least 6 characters"); return; }
    if (pw !== pw2) { toast.error(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"); return; }
    setBusy(true);
    try {
      await reset({ data: { userId, newPassword: pw } });
      toast.success(lang === "ar" ? "تم تحديث كلمة المرور" : "Password updated");
      setOpen(false); setPw(""); setPw2("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{t("resetPassword")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">{t("newPassword")}</label>
            <Input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{lang === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}</label>
            <Input type="password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{t("confirm")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewStaffForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const create = useServerFn(createStaffAccount);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "employee">("employee");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { username: username.trim(), password, role, full_name: fullName.trim() || undefined } });
      toast.success(t("sent"));
      onCreated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">{t("fullName")}</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">{t("username")}</label>
        <Input required minLength={2} value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">{t("password")}</label>
        <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">{t("role")}</label>
        <Select value={role} onValueChange={(v) => setRole(v as "manager" | "employee")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">{t("employee")}</SelectItem>
            {isAdmin && <SelectItem value="manager">{t("manager")}</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{t("save")}</Button>
    </form>
  );
}
