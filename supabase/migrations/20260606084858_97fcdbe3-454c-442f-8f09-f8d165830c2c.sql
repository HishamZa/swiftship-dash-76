-- Allow everyone to read addresses (treated as company office addresses); only staff can modify.
DROP POLICY IF EXISTS "own or staff addresses" ON public.addresses;
CREATE POLICY "anyone can read addresses" ON public.addresses FOR SELECT USING (true);
CREATE POLICY "staff manage addresses" ON public.addresses FOR ALL TO authenticated
  USING (public.has_min_role(auth.uid(), 'employee'::public.app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'employee'::public.app_role));
GRANT SELECT ON public.addresses TO anon;
