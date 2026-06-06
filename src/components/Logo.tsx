import logoAsset from "@/assets/almwanaa-logo.png.asset.json";

export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return <img src={logoAsset.url} alt="Almwanaa" className={`object-contain ${className}`} />;
}
