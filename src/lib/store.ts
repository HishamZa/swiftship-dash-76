export type ShipmentStatus = "st_created" | "st_picked" | "st_transit" | "st_outfd" | "st_delivered";

export type Shipment = {
  id: string;
  customer: string;
  from: string;
  to: string;
  status: ShipmentStatus;
  eta: string;
  history: { status: ShipmentStatus; at: string }[];
};

export type Announcement = {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  at: string;
};

const SK_SHIP = "sc_shipments";
const SK_ANN = "sc_announcements";

const seedShipments: Shipment[] = [
  {
    id: "SC1001",
    customer: "Acme Co.",
    from: "Dubai, UAE",
    to: "London, UK",
    status: "st_transit",
    eta: "2026-06-10",
    history: [
      { status: "st_created", at: "2026-06-01" },
      { status: "st_picked", at: "2026-06-02" },
      { status: "st_transit", at: "2026-06-04" },
    ],
  },
  {
    id: "SC1002",
    customer: "Nori Trading",
    from: "Riyadh, KSA",
    to: "Cairo, EG",
    status: "st_delivered",
    eta: "2026-06-03",
    history: [
      { status: "st_created", at: "2026-05-30" },
      { status: "st_picked", at: "2026-05-31" },
      { status: "st_transit", at: "2026-06-01" },
      { status: "st_outfd", at: "2026-06-03" },
      { status: "st_delivered", at: "2026-06-03" },
    ],
  },
];

const seedAnn: Announcement[] = [
  {
    id: "a1",
    title_en: "New route: Jeddah ↔ Mumbai",
    title_ar: "خط جديد: جدة ↔ مومباي",
    body_en: "Weekly freight service launching this month.",
    body_ar: "خدمة شحن أسبوعية تنطلق هذا الشهر.",
    at: "2026-06-01",
  },
  {
    id: "a2",
    title_en: "Eid holiday schedule",
    title_ar: "جدول إجازة العيد",
    body_en: "Offices closed June 16–18. Tracking remains available online.",
    body_ar: "المكاتب مغلقة من 16 إلى 18 يونيو. التتبع متاح عبر الإنترنت.",
    at: "2026-05-28",
  },
];

function read<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

export const store = {
  getShipments: () => read<Shipment[]>(SK_SHIP, seedShipments),
  setShipments: (s: Shipment[]) => write(SK_SHIP, s),
  getAnnouncements: () => read<Announcement[]>(SK_ANN, seedAnn),
  setAnnouncements: (a: Announcement[]) => write(SK_ANN, a),
};

export const offices = [
  { city_en: "Dubai", city_ar: "دبي", country_en: "UAE", country_ar: "الإمارات", addr_en: "Jebel Ali Free Zone, Block 7", addr_ar: "منطقة جبل علي الحرة، مبنى 7", phone: "+971 4 555 0100" },
  { city_en: "Riyadh", city_ar: "الرياض", country_en: "Saudi Arabia", country_ar: "السعودية", addr_en: "King Fahd Rd, Olaya District", addr_ar: "طريق الملك فهد، حي العليا", phone: "+966 11 555 0200" },
  { city_en: "Cairo", city_ar: "القاهرة", country_en: "Egypt", country_ar: "مصر", addr_en: "New Cairo Logistics Park", addr_ar: "مجمع لوجستيات القاهرة الجديدة", phone: "+20 2 555 0300" },
  { city_en: "London", city_ar: "لندن", country_en: "UK", country_ar: "المملكة المتحدة", addr_en: "Canary Wharf, 25 Bank St", addr_ar: "كناري وارف، 25 بانك ستريت", phone: "+44 20 5550 0400" },
];
