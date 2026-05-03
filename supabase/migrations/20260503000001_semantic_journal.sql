-- Migration: Upgrade journals table dengan semantic intelligence fields
-- Jalankan di Supabase SQL Editor

-- 1. Tambah kolom baru ke tabel journals yang sudah ada
ALTER TABLE public.journals
  ADD COLUMN IF NOT EXISTS raw_text TEXT,
  ADD COLUMN IF NOT EXISTS mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS embedding vector(768),
  ADD COLUMN IF NOT EXISTS emotion_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS core_theme TEXT,
  ADD COLUMN IF NOT EXISTS summary_1_sentence TEXT,
  ADD COLUMN IF NOT EXISTS cognitive_distortions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS intent TEXT CHECK (intent IN ('venting', 'problem_solving', 'gratitude', 'crisis')),
  ADD COLUMN IF NOT EXISTS risk_level INTEGER DEFAULT 0 CHECK (risk_level BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS ici_response TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'guided_journal';

-- 2. Vector index untuk semantic recall
CREATE INDEX IF NOT EXISTS journals_embedding_idx
  ON public.journals
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 3. Tambah 'journal_insight' ke MemoryType di agent_memory
-- (kolom type sudah TEXT, tidak perlu enum change)

-- 4. RLS: pastikan user hanya akses journal sendiri
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own journals" ON public.journals;
CREATE POLICY "Users can manage own journals"
  ON public.journals FOR ALL
  USING (auth.uid() = user_id);

-- 5. Function: match_journal_entries untuk semantic search
CREATE OR REPLACE FUNCTION public.match_journal_entries(
  query_embedding vector(768),
  p_user_id uuid,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  summary_1_sentence text,
  core_theme text,
  emotion_tags text[],
  mood_score int,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.summary_1_sentence,
    j.core_theme,
    j.emotion_tags,
    j.mood_score,
    j.created_at,
    1 - (j.embedding <=> query_embedding) AS similarity
  FROM public.journals j
  WHERE j.user_id = p_user_id
    AND j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> query_embedding) > match_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END; $$;
