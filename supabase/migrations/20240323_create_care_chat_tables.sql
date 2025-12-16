CREATE TABLE IF NOT EXISTS public.chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, professional_id)
);

CREATE TABLE IF NOT EXISTS public.care_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'professional'));

ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own channels" ON public.chat_channels;
CREATE POLICY "Users can view own channels"
ON public.chat_channels FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT id FROM public.users WHERE id = professional_id)
);

DROP POLICY IF EXISTS "Users can create channels" ON public.chat_channels;
CREATE POLICY "Users can create channels"
ON public.chat_channels FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own channels" ON public.chat_channels;
CREATE POLICY "Users can update own channels"
ON public.chat_channels FOR UPDATE
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT id FROM public.users WHERE id = professional_id)
);

DROP POLICY IF EXISTS "Users can view channel messages" ON public.care_chat_messages;
CREATE POLICY "Users can view channel messages"
ON public.care_chat_messages FOR SELECT
USING (
  channel_id IN (
    SELECT id FROM public.chat_channels 
    WHERE user_id = auth.uid() OR professional_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages" ON public.care_chat_messages;
CREATE POLICY "Users can send messages"
ON public.care_chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  channel_id IN (
    SELECT id FROM public.chat_channels 
    WHERE user_id = auth.uid() OR professional_id = auth.uid()
  )
);

alter publication supabase_realtime add table chat_channels;
alter publication supabase_realtime add table care_chat_messages;

CREATE INDEX idx_chat_channels_user_id ON public.chat_channels(user_id);
CREATE INDEX idx_chat_channels_professional_id ON public.chat_channels(professional_id);
CREATE INDEX idx_care_chat_messages_channel_id ON public.care_chat_messages(channel_id);
CREATE INDEX idx_care_chat_messages_created_at ON public.care_chat_messages(created_at DESC);
