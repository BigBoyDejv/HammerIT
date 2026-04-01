-- Add 'data' column to notifications table for metadata
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows selecting the new column
-- (Usually automatic since it's a new column on an existing table)
