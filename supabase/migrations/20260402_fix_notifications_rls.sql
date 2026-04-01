-- supabase/migrations/20260402_fix_notifications_rls.sql

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can see their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Authenticated users can create notifications (necessary for inter-user notifications)
-- This allows a craftsman to notify a client about a new offer
CREATE POLICY "Anyone can create notifications" 
ON notifications FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON notifications FOR DELETE 
USING (auth.uid() = user_id);
