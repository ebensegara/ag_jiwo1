DROP POLICY IF EXISTS "Users can view own channels" ON public.chat_channels;
CREATE POLICY "Users can view own channels"
ON public.chat_channels FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() = professional_id
);

DROP POLICY IF EXISTS "Users can update own channels" ON public.chat_channels;
CREATE POLICY "Users can update own channels"
ON public.chat_channels FOR UPDATE
USING (
  auth.uid() = user_id OR 
  auth.uid() = professional_id
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chat_channels_updated_at ON public.chat_channels;
CREATE TRIGGER update_chat_channels_updated_at
    BEFORE UPDATE ON public.chat_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
