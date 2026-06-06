-- Drop duplicate triggers (keep trg_* names)
DROP TRIGGER IF EXISTS shipments_log_status ON public.shipments;
DROP TRIGGER IF EXISTS trg_notify_customer_on_status_change ON public.shipments;

-- Recreate notify trigger with a single canonical name
DROP TRIGGER IF EXISTS shipments_notify_status ON public.shipments;
CREATE TRIGGER shipments_notify_status
AFTER INSERT OR UPDATE ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.notify_customer_on_status_change();

-- Deduplicate existing status history rows (keep earliest per shipment+status+note)
DELETE FROM public.shipment_status_history a
USING public.shipment_status_history b
WHERE a.shipment_id = b.shipment_id
  AND a.status = b.status
  AND COALESCE(a.note,'') = COALESCE(b.note,'')
  AND a.created_at > b.created_at;

-- Deduplicate existing notifications generated from duplicates
DELETE FROM public.notifications a
USING public.notifications b
WHERE a.user_id = b.user_id
  AND a.shipment_id IS NOT NULL
  AND a.shipment_id = b.shipment_id
  AND COALESCE(a.title,'') = COALESCE(b.title,'')
  AND COALESCE(a.body,'') = COALESCE(b.body,'')
  AND a.created_at > b.created_at;