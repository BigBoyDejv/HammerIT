-- This migration adds the transport_rate column to craftsman_profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE public.craftsman_profiles 
ADD COLUMN IF NOT EXISTS transport_rate numeric DEFAULT null;
