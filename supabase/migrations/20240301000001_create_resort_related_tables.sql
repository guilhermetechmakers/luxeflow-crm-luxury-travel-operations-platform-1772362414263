-- Resort related tables: media, tags, seasonality, ratings, partners, room types

-- Resort media
CREATE TABLE IF NOT EXISTS resort_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT,
  caption TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resort_media_resort_id ON resort_media(resort_id);

ALTER TABLE resort_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON resort_media
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Resort tags (normalized)
CREATE TABLE IF NOT EXISTS resort_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(resort_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_resort_tags_resort_id ON resort_tags(resort_id);
CREATE INDEX IF NOT EXISTS idx_resort_tags_tag ON resort_tags(tag);

ALTER TABLE resort_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON resort_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Resort seasonality
CREATE TABLE IF NOT EXISTS resort_seasonality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  season TEXT,
  start_month INT CHECK (start_month >= 1 AND start_month <= 12),
  end_month INT CHECK (end_month >= 1 AND end_month <= 12),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_resort_seasonality_resort_id ON resort_seasonality(resort_id);

ALTER TABLE resort_seasonality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON resort_seasonality
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Internal ratings
CREATE TABLE IF NOT EXISTS internal_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  reviewer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_ratings_resort_id ON internal_ratings(resort_id);

ALTER TABLE internal_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON internal_ratings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Partners (supplier contacts)
CREATE TABLE IF NOT EXISTS resort_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT,
  contact_info TEXT
);

CREATE INDEX IF NOT EXISTS idx_resort_partners_resort_id ON resort_partners(resort_id);

ALTER TABLE resort_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON resort_partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Room types
CREATE TABLE IF NOT EXISTS resort_room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bed_config TEXT,
  max_occupancy INT
);

CREATE INDEX IF NOT EXISTS idx_resort_room_types_resort_id ON resort_room_types(resort_id);

ALTER TABLE resort_room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON resort_room_types
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Resort presets (saved filters)
CREATE TABLE IF NOT EXISTS resort_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resort_presets_user_id ON resort_presets(user_id);

ALTER TABLE resort_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own presets" ON resort_presets
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read shared presets" ON resort_presets
  FOR SELECT TO authenticated USING (shared = true OR auth.uid() = user_id);
