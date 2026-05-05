-- Enable pgvector if not enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create art_workshops table
CREATE TABLE IF NOT EXISTS public.art_workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  host_type text DEFAULT 'ici_ai', -- 'ici_ai' | 'human_fasilitator'
  type text NOT NULL, -- 'art_therapy' | 'journal_group' | 'breathing_class'
  level text DEFAULT 'pemula',
  duration_min int2 DEFAULT 45,
  max_participant int2 DEFAULT 8,
  scheduled_at timestamptz NOT NULL,
  zoom_link text,
  recording_url text,
  materials_needed text[],
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

-- 2. Create workshop_registrations table
CREATE TABLE IF NOT EXISTS public.workshop_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid REFERENCES public.art_workshops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered', -- 'registered' | 'attended' | 'cancelled'
  checkin_at timestamptz,
  reflection_note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workshop_id, user_id)
);

-- 3. Create workshop_memories table (specific insights from workshops)
CREATE TABLE IF NOT EXISTS public.workshop_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workshop_id uuid REFERENCES public.art_workshops(id) ON DELETE SET NULL,
  content text NOT NULL,
  type text DEFAULT 'workshop_insight',
  importance int2 DEFAULT 7,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.art_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_memories ENABLE ROW LEVEL SECURITY;

-- art_workshops: Everyone can view
CREATE POLICY "Everyone can view workshops"
  ON public.art_workshops FOR SELECT
  USING (true);

-- workshop_registrations: Users can manage their own registrations
CREATE POLICY "Users can manage their own registrations"
  ON public.workshop_registrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- workshop_memories: Users can view their own workshop memories
CREATE POLICY "Users can view their own workshop memories"
  ON public.workshop_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workshop memories"
  ON public.workshop_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function for vector recommendation
CREATE OR REPLACE FUNCTION match_workshops (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  host_type text,
  type text,
  level text,
  duration_min int2,
  max_participant int2,
  scheduled_at timestamptz,
  materials_needed text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    aw.id,
    aw.title,
    aw.description,
    aw.host_type,
    aw.type,
    aw.level,
    aw.duration_min,
    aw.max_participant,
    aw.scheduled_at,
    aw.materials_needed,
    1 - (aw.embedding <=> query_embedding) AS similarity
  FROM art_workshops aw
  WHERE 1 - (aw.embedding <=> query_embedding) > match_threshold
    AND aw.scheduled_at > now()
  ORDER BY aw.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Seed Data (Workshop Examples)
-- Note: Embeddings will be NULL initially, need to be updated via script or first run logic
INSERT INTO public.art_workshops (title, description, type, level, duration_min, max_participant, scheduled_at, materials_needed)
VALUES 
(
  'Gambar Monster Cemas Bareng Ici', 
  'Cemas kamu bentuknya kayak apa? Kasih warna. Kasih nama. Terus kita kenalan sama dia. Dipandu Ici. Nggak ada yang nilai bagus/jelek.', 
  'art_therapy', 'pemula', 45, 8, 
  now() + interval '5 days', 
  ARRAY['Kertas A4', 'Spidol/pensil warna', '10 menit jujur sama diri']
),
(
  'Kolase Mood Board: Aku Minggu Ini', 
  'Gunting majalah bekas / print gambar dari HP. Tempel yang paling "kamu banget" minggu ini. Share cerita 1 menit kalau mau.', 
  'art_therapy', 'pemula', 60, 8, 
  now() + interval '2 days', 
  ARRAY['Majalah bekas', 'Gunting', 'Lem', 'Kertas karton']
),
(
  'Journal Rame-Rame: Nulis Bareng, Nggak Sendirian', 
  'Ici kasih 3 prompt. Kita nulis 20 menit bareng via Zoom, camera off gapapa. Abis itu yang mau share boleh. Healing bareng.', 
  'journal_group', 'semua_level', 30, 8, 
  now() + interval '1 day', 
  ARRAY['Buku + pulpen', 'Atau note HP']
),
(
  'Napin Class: Latihan 4-7-8 Bareng Temen', 
  'Bosen napin sendiri? Yuk bareng. Ici lead, kita napas 3 ronde. Diakhiri sharing "rasanya gimana" 1 kalimat.', 
  'breathing_class', 'pemula', 20, 8, 
  now() + interval '4 days', 
  ARRAY['Tempat duduk nyaman']
);
