import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchCustomers, fetchAllUserRoles, broadcastNotification, sendNotificationToUser, type Profile } from "@/lib/db";
import { toast } from "sonner";
import { Send, Lock, Check, ChevronsUpDown } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().replace(/#/g, "").toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const name = (c.full_name ?? "").toLowerCase();
      const code = (c.customer_code ?? "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [customers, search]);

  const selectedCustomer = useMemo(() => customers.find((c) => c.id === userId), [customers, userId]);

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    if (!isManager) return;
    Promise.all([fetchCustomers(), fetchAllUserRoles()])
      .then(([allProfiles, rolesMap]) => {
        const staffRoles = new Set(["admin", "manager", "employee"]);
        const actualCustomers = allProfiles.filter((p) => {
          const roles = rolesMap[p.id] ?? [];
          return !roles.some((r) => staffRoles.has(r));
        });
        setCustomers(actualCustomers);
      })
      .catch(() => setCustomers([]));
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
            <div>
              <label className="text-xs text-muted-foreground">{t("customer")}</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal shadow-sm cursor-pointer"
                  >
                    <span className="truncate">
                      {selectedCustomer
                        ? `${selectedCustomer.full_name ?? "—"}${selectedCustomer.customer_code ? ` #${selectedCustomer.customer_code}` : ""}`
                        : t("selectCustomer")}
                    </span>
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="flex items-center border-b px-3">
                    <Input
                      placeholder={t("searchCustomer")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus={false}
                      className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredCustomers.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">{t("noResults")}</div>
                    ) : (
                      filteredCustomers.map((c) => {
                        const isSelected = userId === c.id;
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => {
                              setUserId(c.id);
                              setOpen(false);
                              setSearch("");
                            }}
                            className={`relative flex w-full select-none items-center gap-2 rounded-sm px-2 py-2 text-start text-sm outline-none ${isSelected ? "bg-accent text-accent-foreground" : ""}`}
                          >
                            <span className="flex-1 truncate text-start">
                              {c.full_name ?? "—"}
                              {c.customer_code ? <span className="ms-1 text-muted-foreground/70">#{c.customer_code}</span> : null}
                            </span>
                            <Check className={`ms-auto h-4 w-4 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                          </button>
                        );
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
