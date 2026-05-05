-- Fix vector dimension to 3072 to match Gemini embedding model output
DROP FUNCTION IF EXISTS public.match_workshops(vector, float, int);

ALTER TABLE public.art_workshops 
ALTER COLUMN embedding TYPE vector(3072);

-- Update the match_workshops function to expect 3072 dimensions
CREATE OR REPLACE FUNCTION public.match_workshops (
  query_embedding vector(3072),
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


