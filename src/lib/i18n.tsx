import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  brand: { en: "Almwanaa", ar: "الموانئ" },
  tagline: { en: "Track every shipment, anywhere.", ar: "تتبّع كل شحنة، في أي مكان." },
  heroTitle: { en: "Shipping made simple.", ar: "الشحن بأبسط صورة." },
  heroSub: { en: "Track shipments, manage deliveries, and stay informed.", ar: "تتبع الشحنات وإدارة التسليم والبقاء على اطلاع." },
  trackCta: { en: "Track a shipment", ar: "تتبع شحنة" },
  signIn: { en: "Sign in", ar: "تسجيل الدخول" },
  signUp: { en: "Sign up", ar: "إنشاء حساب" },
  signOut: { en: "Sign out", ar: "تسجيل الخروج" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  fullName: { en: "Full name", ar: "الاسم الكامل" },
  phone: { en: "Phone", ar: "الهاتف" },
  haveAccount: { en: "Already have an account?", ar: "لديك حساب؟" },
  noAccount: { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  // nav
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_track: { en: "Track", ar: "تتبع" },
  nav_news: { en: "News", ar: "أخبار" },
  nav_account: { en: "Account", ar: "حسابي" },
  nav_dashboard: { en: "Dashboard", ar: "اللوحة" },
  nav_shipments: { en: "Shipments", ar: "الشحنات" },
  nav_addresses: { en: "Addresses", ar: "العناوين" },
  nav_notifications: { en: "Alerts", ar: "التنبيهات" },
  nav_manage: { en: "Manage", ar: "إدارة" },
  // tracking
  trackTitle: { en: "Track your shipment", ar: "تتبع شحنتك" },
  trackPlaceholder: { en: "Enter tracking number", ar: "أدخل رقم التتبع" },
  trackBtn: { en: "Track", ar: "تتبع" },
  notFound: { en: "Shipment not found.", ar: "لم يتم العثور على الشحنة." },
  // shipment fields
  trackingNo: { en: "Tracking #", ar: "رقم التتبع" },
  customer: { en: "Customer", ar: "العميل" },
  origin: { en: "Origin", ar: "المصدر" },
  destination: { en: "Destination", ar: "الوجهة" },
  shipmentType: { en: "Type", ar: "النوع" },
  weight: { en: "Weight (kg)", ar: "الوزن (كجم)" },
  status: { en: "Status", ar: "الحالة" },
  eta: { en: "Est. delivery", ar: "تاريخ التسليم المتوقع" },
  notes: { en: "Notes", ar: "ملاحظات" },
  timeline: { en: "Timeline", ar: "السجل الزمني" },
  created: { en: "Created", ar: "تاريخ الإنشاء" },
  updated: { en: "Last updated", ar: "آخر تحديث" },
  // status enum
  s_received: { en: "Received", ar: "تم الاستلام" },
  s_in_warehouse: { en: "In Warehouse", ar: "في المستودع" },
  s_ready: { en: "Ready for Shipping", ar: "جاهزة للشحن" },
  s_shipped: { en: "Shipped", ar: "تم الشحن" },
  s_in_transit: { en: "In Transit", ar: "في الطريق" },
  s_arrived_destination: { en: "Arrived at Destination", ar: "وصلت بلد الوجهة" },
  s_out_for_delivery: { en: "Out for Delivery", ar: "في طريقها للتسليم" },
  s_delivered: { en: "Delivered", ar: "تم التسليم" },
  s_delayed: { en: "Delayed", ar: "متأخرة" },
  s_cancelled: { en: "Cancelled", ar: "ملغية" },
  // actions
  add: { en: "Add", ar: "إضافة" },
  save: { en: "Save", ar: "حفظ" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  search: { en: "Search...", ar: "بحث..." },
  filter: { en: "Filter", ar: "تصفية" },
  all: { en: "All", ar: "الكل" },
  // dashboard
  dashboardTitle: { en: "Dashboard", ar: "لوحة التحكم" },
  totalShipments: { en: "Total", ar: "الإجمالي" },
  activeShipments: { en: "Active", ar: "نشطة" },
  deliveredShipments: { en: "Delivered", ar: "تم التسليم" },
  delayedShipments: { en: "Delayed", ar: "متأخرة" },
  monthlyStats: { en: "Last 6 months", ar: "آخر 6 أشهر" },
  recent: { en: "Recent shipments", ar: "أحدث الشحنات" },
  myShipments: { en: "My shipments", ar: "شحناتي" },
  // address book
  addressBook: { en: "Address Book", ar: "دفتر العناوين" },
  name: { en: "Name", ar: "الاسم" },
  country: { en: "Country", ar: "الدولة" },
  city: { en: "City", ar: "المدينة" },
  address: { en: "Address", ar: "العنوان" },
  // announcements
  news: { en: "News & Announcements", ar: "الأخبار والإعلانات" },
  newAnnouncement: { en: "New announcement", ar: "إعلان جديد" },
  title_en: { en: "Title (English)", ar: "العنوان (إنجليزي)" },
  title_ar: { en: "Title (Arabic)", ar: "العنوان (عربي)" },
  body_en: { en: "Body (English)", ar: "المحتوى (إنجليزي)" },
  body_ar: { en: "Body (Arabic)", ar: "المحتوى (عربي)" },
  published: { en: "Published", ar: "منشور" },
  // notifications
  notifications: { en: "Notifications", ar: "التنبيهات" },
  markAllRead: { en: "Mark all read", ar: "تعليم الكل كمقروء" },
  noNotifications: { en: "No notifications yet.", ar: "لا توجد تنبيهات بعد." },
  // misc
  loading: { en: "Loading...", ar: "جارٍ التحميل..." },
  empty: { en: "Nothing to show yet.", ar: "لا يوجد شيء حاليًا." },
  welcome: { en: "Welcome", ar: "مرحبًا" },
  role: { en: "Role", ar: "الدور" },
  admin: { en: "Admin", ar: "مدير" },
  employee: { en: "Employee", ar: "موظف" },
  // offices
  offices: { en: "Our Offices", ar: "مكاتبنا" },
  footer: { en: "© 2026 Almwanaa. All rights reserved.", ar: "© 2026 الموانئ. جميع الحقوق محفوظة." },
} as const;

type DictKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
  dir: "ltr" | "rtl";
};
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

  const t = (k: DictKey) => dict[k]?.[lang] ?? String(k);
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
