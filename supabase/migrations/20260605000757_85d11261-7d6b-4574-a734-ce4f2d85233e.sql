
-- 1. New shipment status enum values
ALTER TYPE public.shipment_status ADD VALUE IF NOT EXISTS 'received_warehouse';
ALTER TYPE public.shipment_status ADD VALUE IF NOT EXISTS 'in_sea_transit';
ALTER TYPE public.shipment_status ADD VALUE IF NOT EXISTS 'arrived_umm_qasr';
ALTER TYPE public.shipment_status ADD VALUE IF NOT EXISTS 'arrived_baghdad';
