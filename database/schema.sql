-- ===================================================================
-- Grievance Management System — Supabase Database Setup
-- Run this entire script in the Supabase SQL Editor (one-time setup)
-- ===================================================================

-- =====================
-- 1. USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
  department TEXT DEFAULT '',
  enrollment_number TEXT DEFAULT '',
  admin_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 2. GRIEVANCES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS grievances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Infrastructure', 'Academic', 'Administrative', 'Financial', 'Hostel', 'Library', 'Examination', 'Other')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  department TEXT DEFAULT '',
  description TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),
  admin_response TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_grievances_ticket_id ON grievances(ticket_id);
CREATE INDEX IF NOT EXISTS idx_grievances_student_id ON grievances(student_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================
-- 4. ROW LEVEL SECURITY
-- =====================

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grievances table RLS
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to grievances"
  ON grievances FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================
-- 5. GRANT PERMISSIONS
-- =====================
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON grievances TO anon;
GRANT ALL ON grievances TO authenticated;

-- =====================
-- 6. UPDATE TRIGGER
-- =====================
-- Auto-update `updated_at` on grievances when modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grievances_updated_at
  BEFORE UPDATE ON grievances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
