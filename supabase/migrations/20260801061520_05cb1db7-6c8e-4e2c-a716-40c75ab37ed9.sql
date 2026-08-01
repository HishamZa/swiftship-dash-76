ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS warehouse_received_at timestamptz;

CREATE OR REPLACE FUNCTION public.log_shipment_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.shipment_status_history (shipment_id, status, note, changed_by, created_at)
    VALUES (
      NEW.id,
      NEW.status,
      NEW.notes,
      auth.uid(),
      CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.warehouse_received_at, now()) ELSE now() END
    );
  END IF;
  RETURN NEW;
END; $function$;