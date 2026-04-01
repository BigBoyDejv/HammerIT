-- Add 'pending_confirmation' to contracts status enum check constraint
-- First, drop the existing constraint
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Then, add the new constraint with 'pending_confirmation' included
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('active', 'completed', 'cancelled', 'disputed', 'pending_confirmation'));
