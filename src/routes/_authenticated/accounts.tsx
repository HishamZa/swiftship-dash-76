import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCustomers, fetchAllUserRoles, type Profile, type AppRole } from "@/lib/db";
import { useServerFn } from "@tanstack/react-start";
import { createStaffAccount } from "@/lib/staff.functions";
import { toast } from "sonner";
import { Plus, Search, UserCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Accounts — Almwanaa" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  const { t } = useI18n();
  const { isStaff, isManager, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rolesMap, setRolesMap] = useState<Record<string, AppRole[]>>({});
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [p, r] = await Promise.all([fetchCustomers(search), fetchAllUserRoles()]);
    setProfiles(p); setRolesMap(r);
  };

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    load().catch(() => {});
    // eslint-disable-next-line
  }, [isStaff, loading, navigate, search]);

  const enriched = useMemo(() => profiles.map((p) => {
    const rs = rolesMap[p.id] ?? [];
    const role: AppRole = rs.includes("admin") ? "admin"
      : rs.includes("manager") ? "manager"
      : rs.includes("employee") ? "employee" : "customer";
    return { ...p, role };
  }), [profiles, rolesMap]);

  const staff = enriched.filter((p) => p.role !== "customer");
  const customers = enriched.filter((p) => p.role === "customer");

  if (!isStaff) return null;

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

        <h2 className="font-semibold text-sm mb-2 mt-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t("staff")}</h2>
        <div className="space-y-2 mb-6">
          {staff.length === 0 && <p className="text-xs text-muted-foreground">{t("empty")}</p>}
          {staff.map((p) => <AccountRow key={p.id} p={p} />)}
        </div>

        <h2 className="font-semibold text-sm mb-2 flex items-center gap-2"><UserCircle2 className="w-4 h-4" /> {t("customers")}</h2>
        <div className="space-y-2">
          {customers.length === 0 && <p className="text-xs text-muted-foreground">{t("empty")}</p>}
          {customers.map((p) => <AccountRow key={p.id} p={p} />)}
        </div>
      </section>
    </Layout>
  );
}

function AccountRow({ p }: { p: Profile & { role: AppRole } }) {
  const { t } = useI18n();
  const tint =
    p.role === "admin" ? "bg-destructive/10 text-destructive"
    : p.role === "manager" ? "bg-warning/20 text-warning-foreground"
    : p.role === "employee" ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
  return (
    <Link to="/accounts/$id" params={{ id: p.id }} className="block rounded-2xl border bg-card p-4">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{p.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{p.phone ?? "—"}{p.governorate ? ` · ${p.governorate}` : ""}{p.area ? ` / ${p.area}` : ""}</p>
        </div>
        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${tint}`}>{t(p.role)}</span>
      </div>
    </Link>
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
