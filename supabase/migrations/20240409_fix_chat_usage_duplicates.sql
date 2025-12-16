-- Delete duplicate records, keep only the latest one
DELETE FROM public.chat_usage
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.chat_usage
  ORDER BY user_id, created_at DESC
);

-- Ensure UNIQUE constraint exists
DROP INDEX IF EXISTS idx_chat_usage_user_id_unique;
CREATE UNIQUE INDEX idx_chat_usage_user_id_unique ON public.chat_usage(user_id);
