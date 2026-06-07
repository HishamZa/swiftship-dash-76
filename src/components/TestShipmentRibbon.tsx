import { useI18n } from "@/lib/i18n";

export function TestShipmentRibbon() {
  const { t, dir } = useI18n();
  // Diagonal ribbon pinned to the top-right (or top-left in RTL) corner.
  const isRtl = dir === "rtl";
  return (
    <div
      aria-hidden={false}
      className="pointer-events-none absolute top-0 z-10 overflow-hidden"
      style={{
        [isRtl ? "left" : "right"]: 0,
        width: 110,
        height: 110,
      }}
    >
      <div
        className="absolute text-white text-[11px] font-bold tracking-wide text-center shadow-md"
        style={{
          background: "rgba(220, 38, 38, 0.85)",
          width: 160,
          padding: "4px 0",
          top: 22,
          [isRtl ? "left" : "right"]: -42,
          transform: `rotate(${isRtl ? -45 : 45}deg)`,
          transformOrigin: "center",
        }}
      >
        {t("testShipment")}
      </div>
    </div>
  );
}
