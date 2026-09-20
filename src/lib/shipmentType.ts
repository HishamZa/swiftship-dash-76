import type { ShipmentStatus } from "@/lib/db";

export type ShipMode = "sea" | "air";

/**
 * Resolve the shipment mode for display. Backward compatible: shipments
 * without a stored type (all legacy rows) are treated as sea shipments.
 * The tracking-number prefix is used as a secondary hint.
 */
export function shipmentMode(s: {
  shipment_type?: string | null;
  tracking_number?: string | null;
} | null | undefined): ShipMode {
  const raw = (s?.shipment_type ?? "").toLowerCase();
  if (raw === "air") return "air";
  if (raw === "sea") return "sea";
  if ((s?.tracking_number ?? "").toUpperCase().includes("-AIR-")) return "air";
  return "sea";
}

/** Mode-aware i18n key for a status label. */
export function statusLabelKey(status: ShipmentStatus, mode: ShipMode) {
  if (mode === "air" && status === "in_sea_transit") return "s_in_air_transit" as const;
  return `s_${status}` as const;
}

/** Measurement label key: CBM for sea, KG for air. */
export function measureKey(mode: ShipMode) {
  return mode === "air" ? ("kg" as const) : ("cbm" as const);
}
