-- IMS Projekt-Anfrage: Supabase Setup
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS projekt_anfragen (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  description text DEFAULT '',
  timeline text DEFAULT '',
  contact_name text NOT NULL,
  contact_company text DEFAULT '',
  contact_phone text NOT NULL,
  callback_requested boolean DEFAULT false,
  file_urls text[] DEFAULT '{}',
  status text DEFAULT 'neu',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projekt_anfragen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts" ON projekt_anfragen FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads" ON projekt_anfragen FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public updates" ON projekt_anfragen FOR UPDATE TO anon USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('projekt-uploads', 'projekt-uploads', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'projekt-uploads');
CREATE POLICY "Allow public reads on uploads" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'projekt-uploads');
