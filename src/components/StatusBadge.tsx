import { useI18n } from "@/lib/i18n";
import { statusKey, type ShipmentStatus } from "@/lib/db";
import { cn } from "@/lib/utils";

const colors: Record<ShipmentStatus, string> = {
  received: "bg-secondary text-secondary-foreground",
  in_warehouse: "bg-secondary text-secondary-foreground",
  ready: "bg-accent/20 text-accent-foreground",
  shipped: "bg-primary/20 text-primary",
  in_transit: "bg-primary/20 text-primary",
  arrived_destination: "bg-accent/30 text-accent-foreground",
  out_for_delivery: "bg-warning/30 text-warning-foreground",
  delivered: "bg-success/30 text-success-foreground",
  delayed: "bg-warning/40 text-warning-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colors[status])}>
      {t(statusKey(status))}
    </span>
  );
}
