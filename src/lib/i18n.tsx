import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

const dict: Dict = {
  brand: { en: "SwiftCargo", ar: "سويفت كارجو" },
  tagline: { en: "Global shipping, simplified.", ar: "شحن عالمي، ببساطة." },
  heroTitle: { en: "Move the world, on time.", ar: "نشحن العالم في الوقت المحدد." },
  heroSub: {
    en: "Reliable freight, parcel, and logistics services across 120+ countries.",
    ar: "خدمات شحن وطرود ولوجستيات موثوقة في أكثر من 120 دولة.",
  },
  trackCta: { en: "Track a shipment", ar: "تتبع شحنة" },
  learnMore: { en: "Learn more", ar: "اعرف المزيد" },
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_track: { en: "Track", ar: "تتبع" },
  nav_addresses: { en: "Offices", ar: "المكاتب" },
  nav_announcements: { en: "News", ar: "الأخبار" },
  nav_customer: { en: "My Account", ar: "حسابي" },
  nav_admin: { en: "Admin", ar: "الإدارة" },
  trackTitle: { en: "Track your shipment", ar: "تتبع شحنتك" },
  trackPlaceholder: { en: "Enter tracking number (e.g. SC1001)", ar: "أدخل رقم التتبع (مثال SC1001)" },
  trackBtn: { en: "Track", ar: "تتبع" },
  notFound: { en: "Shipment not found.", ar: "لم يتم العثور على الشحنة." },
  status: { en: "Status", ar: "الحالة" },
  from: { en: "From", ar: "من" },
  to: { en: "To", ar: "إلى" },
  eta: { en: "ETA", ar: "الوصول المتوقع" },
  history: { en: "Timeline", ar: "السجل" },
  addressesTitle: { en: "Our Offices", ar: "مكاتبنا" },
  announcementsTitle: { en: "Announcements", ar: "الإعلانات" },
  customerTitle: { en: "Customer Dashboard", ar: "لوحة العميل" },
  adminTitle: { en: "Admin Dashboard", ar: "لوحة الإدارة" },
  myShipments: { en: "My Shipments", ar: "شحناتي" },
  allShipments: { en: "All Shipments", ar: "كل الشحنات" },
  addShipment: { en: "Add shipment", ar: "إضافة شحنة" },
  addAnnouncement: { en: "Post announcement", ar: "نشر إعلان" },
  title: { en: "Title", ar: "العنوان" },
  body: { en: "Body", ar: "المحتوى" },
  save: { en: "Save", ar: "حفظ" },
  delete: { en: "Delete", ar: "حذف" },
  tracking: { en: "Tracking #", ar: "رقم التتبع" },
  customer: { en: "Customer", ar: "العميل" },
  footer: { en: "© 2026 SwiftCargo. All rights reserved.", ar: "© 2026 سويفت كارجو. جميع الحقوق محفوظة." },
  st_created: { en: "Created", ar: "تم الإنشاء" },
  st_picked: { en: "Picked up", ar: "تم الاستلام" },
  st_transit: { en: "In transit", ar: "في الطريق" },
  st_outfd: { en: "Out for delivery", ar: "في طريقها للتسليم" },
  st_delivered: { en: "Delivered", ar: "تم التسليم" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict) => string; dir: "ltr" | "rtl" };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) || "en";
    setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? String(k);
  return (
    <I18nCtx.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
