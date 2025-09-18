-- Create tables for Stern Mansion CRM

-- Units table
CREATE TABLE units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  id_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'בהמתנה',
  internal_notes TEXT,
  signature TEXT, -- base64 data URL
  signed_date TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT, -- URL to download signed PDF from server
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked dates table
CREATE TABLE blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App settings table
CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial units
INSERT INTO units (name) VALUES 
  ('סוויטת אבן'),
  ('סוויטת עץ'),
  ('בקתת יוקרה');

-- Insert initial app settings
INSERT INTO app_settings (key, value) VALUES 
  ('app_url', 'https://stern-mansion-crm.vercel.app');

-- Enable Row Level Security (RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow public read access on units" ON units FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on units" ON units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on units" ON units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on units" ON units FOR DELETE USING (true);

CREATE POLICY "Allow public read access on bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on bookings" ON bookings FOR DELETE USING (true);

CREATE POLICY "Allow public read access on blocked_dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on blocked_dates" ON blocked_dates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on blocked_dates" ON blocked_dates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on blocked_dates" ON blocked_dates FOR DELETE USING (true);

CREATE POLICY "Allow public read access on app_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on app_settings" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on app_settings" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on app_settings" ON app_settings FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_bookings_unit_id ON bookings(unit_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_blocked_dates_unit_id ON blocked_dates(unit_id);
CREATE INDEX idx_blocked_dates_dates ON blocked_dates(start_date, end_date);
CREATE INDEX idx_app_settings_key ON app_settings(key);