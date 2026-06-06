
-- 1. Shipment description + notifications.shipment_id
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE;

-- 2. Cascade customer deletion to shipments
ALTER TABLE public.shipments DROP CONSTRAINT IF EXISTS shipments_customer_id_fkey;
ALTER TABLE public.shipments
  ADD CONSTRAINT shipments_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. has_min_role helper (admin=4 > manager=3 > employee=2 > customer=1)
CREATE OR REPLACE FUNCTION public.role_rank(_r app_role)
RETURNS int LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _r
    WHEN 'admin'::app_role THEN 4
    WHEN 'manager'::app_role THEN 3
    WHEN 'employee'::app_role THEN 2
    WHEN 'customer'::app_role THEN 1
    ELSE 0 END
$$;

CREATE OR REPLACE FUNCTION public.has_min_role(_user_id uuid, _min app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND public.role_rank(role) >= public.role_rank(_min)
  )
$$;

CREATE OR REPLACE FUNCTION public.max_role(_user_id uuid)
RETURNS app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY public.role_rank(role) DESC LIMIT 1
$$;

-- 4. Recreate policies to recognize manager
DROP POLICY IF EXISTS "addresses own addresses" ON public.addresses;
DROP POLICY IF EXISTS "own addresses" ON public.addresses;
CREATE POLICY "own or staff addresses" ON public.addresses
  FOR ALL USING (user_id = auth.uid() OR public.has_min_role(auth.uid(), 'employee'))
  WITH CHECK (user_id = auth.uid() OR public.has_min_role(auth.uid(), 'employee'));

DROP POLICY IF EXISTS "admins manage announcements" ON public.announcements;
CREATE POLICY "managers manage announcements" ON public.announcements
  FOR ALL USING (public.has_min_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_min_role(auth.uid(), 'manager'));

DROP POLICY IF EXISTS "staff insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "staff delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "view own or staff" ON public.notifications;
CREATE POLICY "managers insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_min_role(auth.uid(), 'manager'));
CREATE POLICY "staff delete notifications" ON public.notifications
  FOR DELETE USING (public.has_min_role(auth.uid(), 'employee'));
CREATE POLICY "view own or staff notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.has_min_role(auth.uid(), 'employee'));

DROP POLICY IF EXISTS "view own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "view own or staff profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_min_role(auth.uid(), 'employee'));
CREATE POLICY "update own or staff profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.has_min_role(auth.uid(), 'employee'))
  WITH CHECK (auth.uid() = id OR public.has_min_role(auth.uid(), 'employee'));

DROP POLICY IF EXISTS "staff add history" ON public.shipment_status_history;
CREATE POLICY "staff add history" ON public.shipment_status_history
  FOR INSERT WITH CHECK (public.has_min_role(auth.uid(), 'employee'));

DROP POLICY IF EXISTS "staff manage shipments" ON public.shipments;
DROP POLICY IF EXISTS "auth view shipments" ON public.shipments;
CREATE POLICY "staff manage shipments" ON public.shipments
  FOR ALL USING (public.has_min_role(auth.uid(), 'employee'))
  WITH CHECK (public.has_min_role(auth.uid(), 'employee'));
CREATE POLICY "view own or staff shipments" ON public.shipments
  FOR SELECT USING (public.has_min_role(auth.uid(), 'employee') OR customer_id = auth.uid());

-- user_roles: admins manage all; managers can insert/delete manager/employee/customer (not admin) and not self-promote
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "managers add staff roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    public.has_min_role(auth.uid(), 'manager')
    AND role <> 'admin'::app_role
  );
CREATE POLICY "managers delete non-admin roles" ON public.user_roles
  FOR DELETE USING (
    public.has_min_role(auth.uid(), 'manager')
    AND role <> 'admin'::app_role
    AND NOT public.has_role(user_id, 'admin'::app_role)
  );

-- 5. Auto-notify customer on status change
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.notifications (user_id, title, body, shipment_id)
    VALUES (
      NEW.customer_id,
      'Shipment ' || NEW.tracking_number,
      'New status: ' || NEW.status::text || COALESCE(' — ' || NEW.notes, ''),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_customer_on_status_change ON public.shipments;
CREATE TRIGGER trg_notify_customer_on_status_change
AFTER INSERT OR UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.notify_customer_on_status_change();

-- 6. Ensure log_shipment_status trigger exists (recreate)
DROP TRIGGER IF EXISTS trg_log_shipment_status ON public.shipments;
CREATE TRIGGER trg_log_shipment_status
AFTER INSERT OR UPDATE OF status ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.log_shipment_status();

-- 7. Ensure handle_new_user trigger on auth.users (already exists in many setups but make sure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
