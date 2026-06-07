import { useEffect, useState } from "react";
import { fetchAnnouncements, fetchShipments, fetchUnreadCount } from "./db";
import { wasTestShipmentOpened } from "./testShipment";

const EVT = "unread-counts-changed";

function lsKey(kind: string, uid: string) { return `last_seen:${kind}:${uid}`; }
function getLastSeen(kind: string, uid: string): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(lsKey(kind, uid));
  return v ? Number(v) || 0 : 0;
}
function setLastSeen(kind: string, uid: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(lsKey(kind, uid), String(Date.now()));
  window.dispatchEvent(new Event(EVT));
}

export const markNewsSeen = (uid: string) => setLastSeen("news", uid);
export const markShipmentsSeen = (uid: string) => setLastSeen("shipments", uid);

function useUnreadCount(uid: string | undefined, compute: () => Promise<number>) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!uid) { setCount(0); return; }
    let active = true;
    const run = async () => {
      try {
        const n = await compute();
        if (active) setCount(n);
      } catch { if (active) setCount(0); }
    };
    run();
    const onEvt = () => run();
    window.addEventListener(EVT, onEvt);
    window.addEventListener("focus", onEvt);
    const iv = window.setInterval(run, 60_000);
    return () => {
      active = false;
      window.removeEventListener(EVT, onEvt);
      window.removeEventListener("focus", onEvt);
      window.clearInterval(iv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);
  return count;
}

export function useUnreadNewsCount(uid: string | undefined) {
  return useUnreadCount(uid, async () => {
    if (!uid) return 0;
    const items = await fetchAnnouncements(true);
    const seen = getLastSeen("news", uid);
    return items.filter((a) => new Date(a.created_at).getTime() > seen).length;
  });
}

export function useUnreadShipmentsCount(uid: string | undefined) {
  return useUnreadCount(uid, async () => {
    if (!uid) return 0;
    const items = await fetchShipments({ customerId: uid });
    // Onboarding test shipment counts as 1 unread until first opened,
    // but only while the customer has zero real shipments.
    if (items.length === 0) {
      return wasTestShipmentOpened(uid) ? 0 : 1;
    }
    const seen = getLastSeen("shipments", uid);
    return items.filter((s) => new Date(s.created_at).getTime() > seen).length;
  });
}

export function useUnreadNotificationsCount(uid: string | undefined) {
  return useUnreadCount(uid, async () => {
    if (!uid) return 0;
    return await fetchUnreadCount(uid);
  });
}

export function notifyUnreadChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT));
}
