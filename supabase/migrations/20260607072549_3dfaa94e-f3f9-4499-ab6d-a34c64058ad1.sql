
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS entry_type text NOT NULL DEFAULT 'address'
  CHECK (entry_type IN ('office','address'));

UPDATE public.addresses SET entry_type = 'office' WHERE entry_type = 'address';

ALTER TABLE public.addresses ALTER COLUMN entry_type SET DEFAULT 'address';

UPDATE public.shipments
SET tracking_number = regexp_replace(tracking_number, '^MWA-[0-9]{4}-', 'MWA-SEA-')
WHERE tracking_number ~ '^MWA-[0-9]{4}-';
