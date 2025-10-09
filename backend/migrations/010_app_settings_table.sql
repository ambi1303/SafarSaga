-- Migration: Create app_settings table for global application settings
-- This table will store all global settings in a single row for efficiency

CREATE TABLE app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  
  -- General Settings (Company Profile)
  company_name TEXT DEFAULT 'SafarSaga Trips',
  logo_url TEXT,
  contact_email TEXT DEFAULT 'safarsagatrips@gmail.com',
  contact_phone TEXT DEFAULT '+91 9311706027',
  address TEXT DEFAULT 'shop no 3 basement, Plot no 1,Tajpur Rd, Badarpur Extension,Tajpur, badarpur border, NewDelhi, Delhi 110044',
  
  -- Social Media Links
  social_facebook_url TEXT,
  social_instagram_url TEXT,
  social_twitter_url TEXT,
  social_linkedin_url TEXT,
  social_youtube_url TEXT,
  
  -- Booking & Payment Settings
  payment_gateway_key TEXT, -- Should be encrypted in production
  payment_gateway_secret TEXT, -- Should be encrypted in production
  currency TEXT DEFAULT 'INR',
  gstin TEXT,
  gst_rate NUMERIC(5, 2) DEFAULT 5.00,
  terms_and_conditions TEXT DEFAULT 'Standard booking terms and conditions apply. Please read carefully before confirming your booking.',
  
  -- System Settings
  maintenance_mode BOOLEAN DEFAULT false,
  notify_on_new_booking BOOLEAN DEFAULT true,
  notify_on_new_user BOOLEAN DEFAULT true,
  notify_on_payment BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensures only one row can ever exist in this table
  CONSTRAINT singleton_check CHECK (id = 1) 
);

-- Insert the initial default settings row
INSERT INTO app_settings (id, company_name, contact_email, contact_phone, address) 
VALUES (
  1, 
  'SafarSaga Trips',
  'safarsagatrips@gmail.com',
  '+91 9311706027',
  'shop no 3 basement, Plot no 1,Tajpur Rd, Badarpur Extension,Tajpur, badarpur border, NewDelhi, Delhi 110044'
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
