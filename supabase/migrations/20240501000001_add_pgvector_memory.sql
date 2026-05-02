create extension if not exists vector;

alter table public.agent_memory
add column if not exists type text,
add column if not exists importance int,
add column if not exists embedding vector(768),
add column if not exists updated_at timestamptz default now();

create index if not exists agent_memory_embedding_idx 
on public.agent_memory 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.agent_memory enable row level security;

drop policy if exists "User can CRUD own memories" on public.agent_memory;
create policy "User can CRUD own memories" on public.agent_memory
for all using (auth.uid() = user_id);

create or replace function public.remember_with_embedding(
  p_user_id uuid,
  p_content text,
  p_type text,
  p_importance int,
  p_embedding vector(768)
) returns uuid language plpgsql security definer as $$
declare
  new_id uuid;
begin
  insert into public.agent_memory (user_id, content, type, importance, embedding)
  values (p_user_id, p_content, p_type, p_importance, p_embedding)
  returning id into new_id;
  return new_id;
end; $$;

create or replace function public.match_memories(
  query_embedding vector(768),
  p_user_id uuid,
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  type text,
  importance int,
  similarity float
)
language plpgsql security definer as $$
begin
  return query
  select
    am.id,
    am.content,
    am.type,
    am.importance,
    1 - (am.embedding <=> query_embedding) as similarity
  from public.agent_memory am
  where am.user_id = p_user_id
    and am.embedding is not null
    and 1 - (am.embedding <=> query_embedding) > match_threshold
  order by am.embedding <=> query_embedding
  limit match_count;
end; $$;
