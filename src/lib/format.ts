function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Unified app-wide date format: YYYY/MM/DD (e.g. 2026/06/07). */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

/** Unified app-wide date+time format: YYYY/MM/DD HH:mm. */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

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
