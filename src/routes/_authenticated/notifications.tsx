import { formatDateTime } from "@/lib/format";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { fetchNotifications, markAllRead, statusKey, ALL_STATUSES, type Notification, type ShipmentStatus } from "@/lib/db";
import { notifyUnreadChanged } from "@/lib/unreadNews";
import { Bell } from "lucide-react";

function renderShipmentNotification(
  n: Notification,
  t: (k: never) => string,
): { title: string; body: string } {
  const tt = t as unknown as (k: string) => string;
  const rawTitle = n.title ?? "";
  const isNew = rawTitle.startsWith("new_shipment:");
  const isUpdate = rawTitle.startsWith("shipment_update:");
  if (!isNew && !isUpdate) return { title: rawTitle, body: n.body ?? "" };
  const tracking = rawTitle.slice(rawTitle.indexOf(":") + 1);
  const [firstLine, ...rest] = (n.body ?? "").split("\n");
  const isStatus = (ALL_STATUSES as readonly string[]).includes(firstLine);
  const statusText = isStatus ? tt(statusKey(firstLine as ShipmentStatus)) : firstLine;
  const note = rest.join("\n").trim();
  if (isNew) {
    const title = `${tt("newShipmentTitle")} — ${tracking}`;
    const body = `${statusText}${note ? `\n${note}` : ""}`;
    return { title, body };
  }
  const title = `${tt("shipmentUpdateTitle")} — ${tracking}`;
  const body = `${tt("shipmentStatusUpdatedTo")}: ${statusText}${note ? `\n${note}` : ""}`;
  return { title, body };
}

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Almwanaa" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try { setItems(await fetchNotifications(user.id)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  // Mark as read on view.
  useEffect(() => {
    if (user && items.some((n) => !n.read)) {
      markAllRead(user.id).then(() => notifyUnreadChanged()).catch(() => {});
    }
    // eslint-disable-next-line
  }, [items.length, user]);

  const onMarkAll = async () => {
    if (!user) return;
    await markAllRead(user.id);
    load();
  };

  return (
    <Layout>
      <section className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Bell className="w-5 h-5" /> {t("notifications")}</h1>
        {items.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={onMarkAll}>{t("markAllRead")}</Button>
        )}
      </section>

      <section className="px-5 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>}
        {items.map((n) => {
          const { title, body } = renderShipmentNotification(n, t);
          return (
            <div key={n.id} className={`rounded-2xl border p-4 ${n.read ? "bg-card" : "bg-primary/5 border-primary/20"}`}>
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-sm">{title}</p>
                <span className="text-[10px] text-muted-foreground">{formatDateTime(n.created_at)}</span>
              </div>
              {body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{body}</p>}
            </div>
          );
        })}
      </section>
    </Layout>
  );
}
