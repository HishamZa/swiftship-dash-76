CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.customer_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.notifications (user_id, title, body, shipment_id)
    VALUES (
      NEW.customer_id,
      'shipment_update:' || NEW.tracking_number,
      NEW.status::text || COALESCE(E'\n' || NEW.notes, ''),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$function$;