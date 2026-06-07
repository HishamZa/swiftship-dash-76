import { useI18n } from "@/lib/i18n";
import { statusKey, type StatusHistory } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Check } from "lucide-react";

export function StatusTimeline({ history }: { history: StatusHistory[] }) {
  const { t } = useI18n();
  if (history.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  return (
    <ol className="relative ms-3 border-s border-border">
      {history.map((h, i) => (
        <li key={h.id} className="mb-6 ms-6">
          <span className="absolute -start-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
          <h4 className="font-medium">{t(statusKey(h.status))}</h4>
          <time className="block text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</time>
          {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
          {i === history.length - 1 && <span className="sr-only">current</span>}
        </li>
      ))}
    </ol>
  );
}
