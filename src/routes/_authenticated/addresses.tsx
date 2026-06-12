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

    const isArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
    const name = profile.full_name ?? "—";
    const addr = userAddress || [profile.governorate, profile.area].filter(Boolean).join(" / ") || "—";
    const code = `Customer Code : #${profile.customer_code ?? "----"}`;
    const brand = "Almwanaa co";

    const fontFor = (text: string, size: number, forceBold = false) => {
      const bold = forceBold || isArabic(text) ? "bold " : "bold ";
      return `${bold}${size}px Arial, sans-serif`;
    };

    // sizes
    const sizes = { brand: 44, name: 36, addr: 28, code: 30 };
    const lineGap = 14;
    const padX = 40;
    const padY = 30;
    const maxW = 760;

    // measure addr wrap
    const measureCanvas = document.createElement("canvas");
    const mctx = measureCanvas.getContext("2d")!;
    const wrap = (text: string, size: number): string[] => {
      mctx.font = fontFor(text, size);
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (mctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const addrLines = wrap(addr, sizes.addr);

    // compute width
    mctx.font = fontFor(brand, sizes.brand);
    const wBrand = mctx.measureText(brand).width;
    mctx.font = fontFor(name, sizes.name);
    const wName = mctx.measureText(name).width;
    mctx.font = fontFor(code, sizes.code);
    const wCode = mctx.measureText(code).width;
    let wAddr = 0;
    mctx.font = fontFor(addr, sizes.addr);
    for (const l of addrLines) wAddr = Math.max(wAddr, mctx.measureText(l).width);

    const contentW = Math.ceil(Math.max(wBrand, wName, wAddr, wCode));
    const W = contentW + padX * 2;

    const lineHeights = [
      sizes.brand,
      sizes.name,
      ...addrLines.map(() => sizes.addr),
      sizes.code,
    ];
    const contentH = lineHeights.reduce((a, b) => a + b, 0) + lineGap * (lineHeights.length - 1);
    const H = contentH + padY * 2;

    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const cx = W / 2;
    let y = padY;

    const drawLine = (text: string, size: number) => {
      ctx.font = fontFor(text, size);
      ctx.fillText(text, cx, y);
      y += size + lineGap;
    };

    drawLine(brand, sizes.brand);
    drawLine(name, sizes.name);
    for (const l of addrLines) drawLine(l, sizes.addr);
    drawLine(code, sizes.code);

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
          <p className="text-xs text-muted-foreground text-center">
            {t("shippingMarkDesc")}
          </p>
          {markUrl && (
            <div className="space-y-3">
              <img
                src={markUrl}
                alt="Shipping mark"
                className="max-w-full mx-auto rounded-lg border bg-white"
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

