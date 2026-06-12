
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customer_code text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_customer_code_key ON public.profiles(customer_code) WHERE customer_code IS NOT NULL;

CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_attempts int := 0;
BEGIN
  LOOP
    v_code := lpad(floor(random()*10000)::int::text, 4, '0');
    PERFORM 1 FROM public.profiles WHERE customer_code = v_code;
    IF NOT FOUND THEN
      RETURN v_code;
    END IF;
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique customer code';
    END IF;
  END LOOP;
END;
$$;

-- Drop the phone check constraint temporarily so we can backfill all rows,
-- then re-add it as NOT VALID (the original state).
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_11_digits;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE customer_code IS NULL LOOP
    UPDATE public.profiles SET customer_code = public.generate_customer_code() WHERE id = r.id;
  END LOOP;
END$$;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_11_digits
  CHECK (phone IS NULL OR phone ~ '^[0-9]{11}$') NOT VALID;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, governorate, area, customer_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'governorate',
    NEW.raw_user_meta_data->>'area',
    public.generate_customer_code()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;
