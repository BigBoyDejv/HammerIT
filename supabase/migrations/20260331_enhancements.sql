/*
  # Marketplace Enhancements Migration
  
  ## Changes:
  1. profiles: add email, is_verified, verification_status columns
  2. job_requests: add lat, lng columns for geolocation
  3. New verification_documents table for KYC workflow
  4. New RLS policies for verification documents
  5. Add policy for public profile reading (needed for chat, craftsman browsing)
  6. Indexes for geolocation queries
*/

-- ============================================
-- 1. PROFILES TABLE UPDATES
-- ============================================

-- Add email column (may already exist in some setups)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Add verification columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));

-- Allow authenticated users to read ALL profiles (needed for chat, craftsman browsing, etc.)
-- Drop existing restrictive policy if it exists and create a broader one
DO $$
BEGIN
  -- Check if a broader read policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Authenticated users can view all profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================
-- 2. JOB_REQUESTS TABLE UPDATES (Geolocation)
-- ============================================

ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS lat float8;
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS lng float8;

-- Index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_job_requests_lat_lng ON job_requests(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- ============================================
-- 3. VERIFICATION DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS verification_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_url text NOT NULL,
  document_type text DEFAULT 'id_card',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification documents"
  ON verification_documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can submit verification documents
CREATE POLICY "Users can submit verification documents"
  ON verification_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- ============================================
-- 4. ENABLE REALTIME FOR KEY TABLES
-- ============================================

-- Enable realtime for messages (for typing indicators and read receipts)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
