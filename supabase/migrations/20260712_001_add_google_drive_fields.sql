-- Add Google Drive and Sheets integration fields to profiles table
-- These fields store the IDs of the Drive folder and Sheets database created during OAuth setup

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS google_drive_folder_id text,
  ADD COLUMN IF NOT EXISTS google_sheets_db_id text;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_google_drive_folder_id ON public.profiles(google_drive_folder_id);
CREATE INDEX IF NOT EXISTS idx_profiles_google_sheets_db_id ON public.profiles(google_sheets_db_id);
