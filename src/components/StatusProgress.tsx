import { useI18n } from "@/lib/i18n";
import { TIMELINE_STATUSES, statusKey, type ShipmentStatus } from "@/lib/db";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusProgress({ current }: { current: ShipmentStatus }) {
  const { t } = useI18n();
  // If current isn't part of timeline (delayed/cancelled), show 0 progress.
  const idx = TIMELINE_STATUSES.indexOf(current);
  return (
    <ol className="space-y-3">
      {TIMELINE_STATUSES.map((s, i) => {
        const done = idx >= 0 && i <= idx;
        const active = idx >= 0 && i === idx;
        return (
          <li key={s} className="flex items-start gap-3">
            <div className={cn(
              "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
              done ? "bg-primary border-primary text-primary-foreground" :
                     "bg-card border-muted text-muted-foreground"
            )}>
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <p className={cn("text-sm", active ? "font-bold text-primary" : done ? "font-medium" : "text-muted-foreground")}>
                {t(statusKey(s))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
