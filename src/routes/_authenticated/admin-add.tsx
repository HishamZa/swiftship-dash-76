import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetchCustomers, fetchAllUserRoles, createShipment, generateTrackingNumber, type Profile } from "@/lib/db";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RefreshCw, ChevronsUpDown, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin-add")({
  head: () => ({ meta: [{ title: "Add Shipment — Almwanaa" }] }),
  component: AdminAddPage,
});

function AdminAddPage() {
  const { t } = useI18n();
  const { isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [tracking, setTracking] = useState(generateTrackingNumber());
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [cbm, setCbm] = useState("");
  const [eta, setEta] = useState("");
  const [remainingDays, setRemainingDays] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!isStaff) { navigate({ to: "/dashboard", replace: true }); return; }
    (async () => {
      const [profiles, rolesMap] = await Promise.all([
        fetchCustomers().catch(() => [] as Profile[]),
        fetchAllUserRoles().catch(() => ({} as Record<string, string[]>)),
      ]);
      // Customers only — exclude admin/manager/employee.
      setCustomers(profiles.filter((p) => {
        const rs = rolesMap[p.id] ?? [];
        return !rs.some((r) => r === "admin" || r === "manager" || r === "employee");
      }));
    })();
  }, [isStaff, loading, navigate]);

  // Tag duplicates (same name+phone, different IDs) with a short ID suffix so
  // managers can distinguish them in the dropdown.
  const dupKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of customers) {
      const k = `${c.full_name ?? ""}|${c.phone ?? ""}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return new Set(Array.from(counts.entries()).filter(([, n]) => n > 1).map(([k]) => k));
  }, [customers]);

  const selected = useMemo(() => customers.find((c) => c.id === customerId), [customers, customerId]);

  if (!isStaff) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) { toast.error(t("selectCustomer")); return; }
    setBusy(true);
    try {
      await createShipment({
        tracking_number: tracking.trim(),
        customer_id: selected.id,
        customer_name: selected.full_name ?? "—",
        phone: selected.phone,
        origin_country: "China",
        destination_country: "Iraq",
        status: "received_warehouse",
        description: description || null,
        estimated_cost: cost ? Number(cost) : null,
        cbm_volume: cbm ? Number(cbm) : null,
        estimated_delivery: eta || null,
        customer_notes: customerNotes || null,
      });
      toast.success(t("sent"));
      setTracking(generateTrackingNumber());
      setDescription(""); setCost(""); setCbm(""); setEta(""); setRemainingDays(""); setCustomerNotes("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("addShipment")}</h1>
      </section>

      <section className="px-5">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">{t("customer")}</label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder={t("selectCustomer")} /></SelectTrigger>
              <SelectContent>
                {customers.map((c) => {
                  const isDup = dupKeys.has(`${c.full_name ?? ""}|${c.phone ?? ""}`);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.full_name ?? "—")}{c.phone ? ` · ${c.phone}` : ""}
                      {isDup ? ` · #${c.id.slice(0, 4)}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t("trackingNo")} <span className="opacity-60">({t("autoGenerated")})</span></label>
            <div className="flex gap-2">
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} />
              <Button type="button" variant="outline" size="icon" onClick={() => setTracking(generateTrackingNumber())}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t("description")}</label>
            <Input placeholder={t("descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">{t("estimatedCost")} ($)</label>
              <Input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("cbm")} (CBM)</label>
              <Input type="number" step="0.001" value={cbm} onChange={(e) => setCbm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">{t("eta")}</label>
              <Input
                type="date"
                value={eta}
                onChange={(e) => {
                  setEta(e.target.value);
                  if (e.target.value) {
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const d = new Date(e.target.value);
                    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
                    setRemainingDays(diff >= 0 ? String(diff) : "");
                  } else {
                    setRemainingDays("");
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("remainingDays")}</label>
              <Input
                type="number"
                min="0"
                value={remainingDays}
                onChange={(e) => {
                  setRemainingDays(e.target.value);
                  const n = Number(e.target.value);
                  if (e.target.value !== "" && Number.isFinite(n) && n >= 0) {
                    const d = new Date(); d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() + n);
                    setEta(d.toISOString().slice(0, 10));
                  } else {
                    setEta("");
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t("customerNotes")}</label>
            <Textarea rows={3} value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>{t("save")}</Button>
        </form>
      </section>
    </Layout>
  );
}
