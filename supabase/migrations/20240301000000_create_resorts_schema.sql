-- Resort Bible (Directory) schema for LuxeFlow CRM
-- Resorts master table with standardized fields

CREATE TABLE IF NOT EXISTS resorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location JSONB NOT NULL DEFAULT '{}',
  transfer_time TEXT,
  kids_policy TEXT,
  dining TEXT[] DEFAULT '{}',
  seasonality JSONB DEFAULT '[]',
  internal_rating NUMERIC(2,1),
  tags TEXT[] DEFAULT '{}',
  perks TEXT[] DEFAULT '{}',
  room_types JSONB DEFAULT '[]',
  price_band TEXT,
  restrictions TEXT,
  panel_notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faceted search
CREATE INDEX IF NOT EXISTS idx_resorts_name ON resorts USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_resorts_location ON resorts USING gin(location);
CREATE INDEX IF NOT EXISTS idx_resorts_tags ON resorts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_resorts_perks ON resorts USING gin(perks);
CREATE INDEX IF NOT EXISTS idx_resorts_internal_rating ON resorts(internal_rating);
CREATE INDEX IF NOT EXISTS idx_resorts_created_at ON resorts(created_at DESC);

-- RLS
ALTER TABLE resorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated" ON resorts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated" ON resorts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update for authenticated" ON resorts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete for authenticated" ON resorts
  FOR DELETE TO authenticated USING (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resorts_updated_at
  BEFORE UPDATE ON resorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
