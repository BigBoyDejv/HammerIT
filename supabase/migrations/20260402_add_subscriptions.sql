-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    trial_start TIMESTAMPTZ DEFAULT NOW(),
    trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

-- Function to handle new craftsman registration and grant trial
CREATE OR REPLACE FUNCTION public.handle_new_craftsman_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user is a craftsman
    IF (SELECT role FROM public.profiles WHERE id = NEW.id) = 'craftsman' THEN
        INSERT INTO public.subscriptions (user_id, status)
        VALUES (NEW.id, 'trialing')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create trial subscription after profile creation
-- Note: Assuming profiles are created after auth registration
CREATE TRIGGER on_craftsman_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_craftsman_subscription();

-- Backfill for existing craftsmen (optional but good for testing)
INSERT INTO public.subscriptions (user_id, status)
SELECT id, 'trialing' 
FROM public.profiles 
WHERE role = 'craftsman'
ON CONFLICT (user_id) DO NOTHING;
