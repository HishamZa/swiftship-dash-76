import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllAddresses, fetchProfile, fetchAddresses, type AddressEntry, type Profile } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Copy, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Address Book — Almwanaa" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [markUrl, setMarkUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAddresses()
      .then((all) => setItems(all.filter((a) => a.entry_type === "address")))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(setProfile).catch(() => setProfile(null));
    fetchAddresses(user.id).then((rows) => {
      const own = rows.find((r) => r.entry_type === "address" && r.address) ?? rows.find((r) => r.address);
      const composed = own?.address
        ?? [profile?.governorate, profile?.area].filter(Boolean).join(" / ");
      setUserAddress(composed || "");
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Clean up generated image when leaving the page
  useEffect(() => () => setMarkUrl(null), []);

  const copyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("addressCopied"));
    } catch {
      toast.error("Error");
    }
  };

  const generateMark = () => {
    if (!profile) { toast.error(t("loading")); return; }
    const W = 800, H = 600;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const cx = W / 2;
    let y = 110;

    ctx.font = "bold 48px Arial, sans-serif";
    ctx.fillText("Almwanaa co", cx, y);
    y += 100;

    ctx.font = "bold 40px Arial, sans-serif";
    ctx.fillText(profile.full_name ?? "—", cx, y);
    y += 90;

    ctx.font = "32px Arial, sans-serif";
    const addr = userAddress || [profile.governorate, profile.area].filter(Boolean).join(" / ") || "—";
    wrapText(ctx, addr, cx, y, W - 80, 40);
    y += 120;

    ctx.font = "bold 36px Arial, sans-serif";
    ctx.fillText(`Customer Code : #${profile.customer_code ?? "----"}`, cx, H - 80);

    setMarkUrl(canvas.toDataURL("image/png"));
  };

  const downloadMark = () => {
    if (!markUrl) return;
    const a = document.createElement("a");
    a.href = markUrl;
    a.download = `shipping-mark-${profile?.customer_code ?? "code"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("addressBook")}</h1>
      </section>

      <section className="px-5 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("empty")}</p>}
        {items.map((a) => (
          <div key={a.id} className="rounded-2xl border bg-card p-4">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.name}</p>
                {a.address && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{a.address}</p>
                )}
              </div>
              {a.address && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyAddress(a.address!)}
                  aria-label={t("copy")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="px-5 mt-8 mb-10 space-y-3">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> {t("shippingMarkGenerator")}
          </h2>
          <Button type="button" className="w-full" onClick={generateMark}>
            {t("showShippingMark")}
          </Button>
          {markUrl && (
            <div className="space-y-3">
              <img
                src={markUrl}
                alt="Shipping mark"
                className="w-full rounded-lg border bg-white"
              />
              <Button type="button" variant="secondary" className="w-full" onClick={downloadMark}>
                <Download className="w-4 h-4 me-1" /> {t("saveImage")}
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    const w = ctx.measureText(test).width;
    if (w > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}
