
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_announcement_views(p_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.announcements SET view_count = view_count + 1 WHERE id = p_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_announcement_views(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.notifications (user_id, title, body, shipment_id)
      VALUES (
        NEW.customer_id,
        'new_shipment:' || NEW.tracking_number,
        NEW.status::text,
        NEW.id
      );
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.notifications (user_id, title, body, shipment_id)
      VALUES (
        NEW.customer_id,
        'shipment_update:' || NEW.tracking_number,
        NEW.status::text || COALESCE(E'\n' || NEW.notes, ''),
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
