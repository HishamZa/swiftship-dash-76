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
  delivered: "bg-green-500/90 text-white",
  delayed: "bg-warning/40 text-warning-foreground",
  cancelled: "bg-destructive/20 text-destructive",
  received_warehouse: "bg-secondary text-secondary-foreground",
  in_sea_transit: "bg-primary/20 text-primary",
  arrived_umm_qasr: "bg-accent/30 text-accent-foreground",
  arrived_baghdad: "bg-accent/40 text-accent-foreground",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 min-h-[20px]", colors[status])}>
      {t(statusKey(status))}
    </span>
  );
}
