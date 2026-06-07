import { useEffect, useState } from "react";
import type { Shipment, StatusHistory } from "./db";

export const TEST_SHIPMENT_ID = "test-onboarding";

export const isTestShipmentId = (id: string) => id === TEST_SHIPMENT_ID;

const OPENED_EVT = "test-shipment-opened-changed";
const openedKey = (uid: string) => `test_shipment_opened:${uid}`;

export function wasTestShipmentOpened(uid: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(openedKey(uid)) === "1";
}

export function markTestShipmentOpened(uid: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(openedKey(uid)) === "1") return;
  localStorage.setItem(openedKey(uid), "1");
  window.dispatchEvent(new Event(OPENED_EVT));
  // Also nudge the global unread-counts listeners so the My Shipments badge
  // refreshes immediately after the customer opens the test shipment.
  window.dispatchEvent(new Event("unread-counts-changed"));
}

export function useTestShipmentOpened(uid: string | undefined): boolean {
  const [opened, setOpened] = useState<boolean>(() => (uid ? wasTestShipmentOpened(uid) : false));
  useEffect(() => {
    if (!uid) { setOpened(false); return; }
    const sync = () => setOpened(wasTestShipmentOpened(uid));
    sync();
    window.addEventListener(OPENED_EVT, sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(OPENED_EVT, sync);
      window.removeEventListener("focus", sync);
    };
  }, [uid]);
  return opened;
}

export function buildTestShipment(userId: string, customerName: string): Shipment {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();
  return {
    id: TEST_SHIPMENT_ID,
    tracking_number: "MWA-DEMO-0001",
    customer_id: userId,
    customer_name: customerName,
    phone: null,
    origin_country: "China",
    destination_country: "Iraq",
    shipment_type: null,
    weight: null,
    status: "in_sea_transit",
    notes: null,
    customer_notes: null,
    description: null,
    estimated_cost: 25,
    cbm_volume: 0.1,
    estimated_delivery: today,
    created_at: nowIso,
    updated_at: nowIso,
  };
}

export const TEST_REMAINING_TEXT = { en: "45 days remaining", ar: "متبقي 45 يوم" } as const;
