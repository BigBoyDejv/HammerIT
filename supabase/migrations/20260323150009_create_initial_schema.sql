/*
  # Initial Database Schema for Craft Services Platform
  
  ## Overview
  This migration creates the complete database schema for a craft services intermediation platform,
  similar to task marketplaces but focused on manual labor and craftsmen services.
  
  ## Tables Created
  
  ### 1. profiles
  Extended user profile information for both clients and craftsmen
  - Links to auth.users
  - Stores: role, full_name, avatar_url, phone, bio
  - Supports both client and craftsman roles
  
  ### 2. craftsman_profiles
  Additional information specific to craftsmen
  - Specialization, hourly rate, experience
  - Verification status, ratings, total jobs completed
  
  ### 3. job_requests
  Job postings created by clients
  - Title, description, category, location
  - Budget range, status tracking
  
  ### 4. job_offers
  Offers submitted by craftsmen for specific jobs
  - Price quotes, estimated duration
  - Status: pending, accepted, rejected
  
  ### 5. contracts
  Active agreements between clients and craftsmen
  - Final price, payment status
  - Contract lifecycle management
  
  ### 6. reviews
  Ratings and reviews after job completion
  - 1-5 star rating system
  - Text comments
  
  ### 7. conversations
  Chat conversation threads between users
  - Two-participant conversations
  - Last message timestamp tracking
  
  ### 8. messages
  Individual chat messages
  - Links to conversations
  - Read status tracking
  
  ### 9. notifications
  In-app notification system
  - Various notification types
  - Read/unread status
  
  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Craftsmen and clients have appropriate permissions
  - Public read access for craftsman profiles (for browsing)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'craftsman')),
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Craftsman profiles table
CREATE TABLE IF NOT EXISTS craftsman_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialization text[] NOT NULL DEFAULT '{}',
  hourly_rate decimal(10,2),
  years_experience integer DEFAULT 0,
  verified boolean DEFAULT false,
  rating_avg decimal(3,2) DEFAULT 0,
  total_jobs integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE craftsman_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view craftsman profiles"
  ON craftsman_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Craftsmen can update own profile"
  ON craftsman_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Craftsmen can insert own profile"
  ON craftsman_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Job requests table
CREATE TABLE IF NOT EXISTS job_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  budget_min decimal(10,2),
  budget_max decimal(10,2),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open job requests"
  ON job_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create job requests"
  ON job_requests FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own job requests"
  ON job_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete own job requests"
  ON job_requests FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Job offers table
CREATE TABLE IF NOT EXISTS job_offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_request_id uuid REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
  craftsman_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price decimal(10,2) NOT NULL,
  estimated_duration text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_request_id, craftsman_id)
);

ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Craftsmen can view own offers"
  ON job_offers FOR SELECT
  TO authenticated
  USING (craftsman_id = auth.uid());

CREATE POLICY "Clients can view offers for their jobs"
  ON job_offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_requests
      WHERE job_requests.id = job_offers.job_request_id
      AND job_requests.client_id = auth.uid()
    )
  );

CREATE POLICY "Craftsmen can create offers"
  ON job_offers FOR INSERT
  TO authenticated
  WITH CHECK (craftsman_id = auth.uid());

CREATE POLICY "Craftsmen can update own offers"
  ON job_offers FOR UPDATE
  TO authenticated
  USING (craftsman_id = auth.uid())
  WITH CHECK (craftsman_id = auth.uid());

CREATE POLICY "Clients can update offer status"
  ON job_offers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_requests
      WHERE job_requests.id = job_offers.job_request_id
      AND job_requests.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_requests
      WHERE job_requests.id = job_offers.job_request_id
      AND job_requests.client_id = auth.uid()
    )
  );

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_request_id uuid REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
  craftsman_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  final_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'disputed')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Craftsmen can view own contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (craftsman_id = auth.uid());

CREATE POLICY "Participants can update contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR craftsman_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR craftsman_id = auth.uid());

CREATE POLICY "System can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() OR craftsman_id = auth.uid());

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, reviewer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contract participants can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = reviews.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.craftsman_id = auth.uid())
    )
  );

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 < participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Message recipients can mark as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
      AND sender_id != auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
      AND sender_id != auth.uid()
    )
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_craftsman_profiles_user_id ON craftsman_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_category ON job_requests(category);
CREATE INDEX IF NOT EXISTS idx_job_offers_job_request_id ON job_offers(job_request_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_craftsman_id ON job_offers(craftsman_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_craftsman_id ON contracts(craftsman_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);