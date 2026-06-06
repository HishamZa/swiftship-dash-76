DROP POLICY IF EXISTS "users see own roles" ON public.user_roles;
CREATE POLICY "users see own roles or staff sees all"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_min_role(auth.uid(), 'employee'));