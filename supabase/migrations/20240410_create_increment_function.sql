-- Create function to safely increment chat count
CREATE OR REPLACE FUNCTION increment_chat_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chat_usage
  SET 
    chat_count = chat_count + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;
