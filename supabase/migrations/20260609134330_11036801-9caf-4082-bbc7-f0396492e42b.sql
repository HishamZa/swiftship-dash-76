
CREATE TABLE public.announcement_views (
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (announcement_id, user_id)
);

GRANT SELECT, INSERT ON public.announcement_views TO authenticated;
GRANT ALL ON public.announcement_views TO service_role;

ALTER TABLE public.announcement_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their own views"
  ON public.announcement_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own views"
  ON public.announcement_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_announcement_views(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_inserted boolean := false;
BEGIN
  IF v_user IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.announcement_views (announcement_id, user_id)
  VALUES (p_id, v_user)
  ON CONFLICT (announcement_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    UPDATE public.announcements SET view_count = view_count + 1 WHERE id = p_id;
  END IF;
END;
$$;

-- Backfill view_count from any existing distinct views (table is new, so this is a no-op but safe)
UPDATE public.announcements a
SET view_count = COALESCE((SELECT count(*) FROM public.announcement_views v WHERE v.announcement_id = a.id), 0)
WHERE EXISTS (SELECT 1 FROM public.announcement_views v WHERE v.announcement_id = a.id);
