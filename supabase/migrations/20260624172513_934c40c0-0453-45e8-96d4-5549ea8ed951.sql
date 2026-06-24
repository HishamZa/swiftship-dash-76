CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_attempts int := 0;
  v_count bigint;
  v_len int;
  v_max bigint;
BEGIN
  SELECT count(*) INTO v_count FROM public.profiles WHERE customer_code IS NOT NULL;
  -- length grows with customer count: <=9999 -> 4, <=99999 -> 5, etc.
  v_len := GREATEST(4, length((v_count + 1)::text));
  LOOP
    v_max := power(10, v_len)::bigint;
    v_code := lpad(floor(random() * v_max)::bigint::text, v_len, '0');
    PERFORM 1 FROM public.profiles WHERE customer_code = v_code;
    IF NOT FOUND THEN
      RETURN v_code;
    END IF;
    v_attempts := v_attempts + 1;
    IF v_attempts > 200 THEN
      v_len := v_len + 1;
      v_attempts := 0;
    END IF;
  END LOOP;
END;
$function$;