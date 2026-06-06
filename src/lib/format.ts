export function formatUSD(v: number | string | null | undefined): string {
  if (v == null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatCBM(v: number | string | null | undefined): string {
  if (v == null || v === "") return "—";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 3 })} CBM`;
}

export type CountdownLang = "en" | "ar";

export function deliveryCountdown(date: string | null | undefined, lang: CountdownLang = "en"): string | null {
  if (!date) return null;
  const target = new Date(date + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (lang === "ar") {
    if (diff === 0) return "اليوم";
    if (diff > 0) return `متبقي ${diff} يوم`;
    return `متأخر ${Math.abs(diff)} يوم`;
  }
  if (diff === 0) return "Today";
  if (diff > 0) return `${diff} day${diff === 1 ? "" : "s"} remaining`;
  return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"}`;
}
