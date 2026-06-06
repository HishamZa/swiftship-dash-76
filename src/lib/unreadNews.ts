import { useEffect, useState } from "react";
import { fetchAnnouncements } from "./db";

const KEY = (uid: string) => `news_last_seen:${uid}`;
const EVT = "news-last-seen-changed";

export function getLastSeen(uid: string): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(KEY(uid));
  return v ? Number(v) || 0 : 0;
}

export function markNewsSeen(uid: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(uid), String(Date.now()));
  window.dispatchEvent(new Event(EVT));
}

export function useUnreadNewsCount(uid: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!uid) { setCount(0); return; }
    let active = true;
    const recompute = async () => {
      try {
        const items = await fetchAnnouncements(true);
        const lastSeen = getLastSeen(uid);
        const n = items.filter((a) => new Date(a.created_at).getTime() > lastSeen).length;
        if (active) setCount(n);
      } catch {
        if (active) setCount(0);
      }
    };
    recompute();
    const onEvt = () => recompute();
    window.addEventListener(EVT, onEvt);
    window.addEventListener("focus", onEvt);
    const iv = window.setInterval(recompute, 60_000);
    return () => {
      active = false;
      window.removeEventListener(EVT, onEvt);
      window.removeEventListener("focus", onEvt);
      window.clearInterval(iv);
    };
  }, [uid]);

  return count;
}
