ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS interview_address text,
  ADD COLUMN IF NOT EXISTS interview_arrival_details text;
