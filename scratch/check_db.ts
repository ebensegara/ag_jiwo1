import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const userId = '047f4eb1-771d-4d40-b468-58f7e9319000'
  
  console.log('Checking Journals for user:', userId)
  const { data: journals, error: jError } = await supabase
    .from('journals')
    .select('id, title, core_theme, key_facts, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (jError) console.error('Journal Error:', jError)
  else console.log('Journals found:', journals?.length || 0, journals)

  console.log('\nChecking Agent Memory for user:', userId)
  const { data: memories, error: mError } = await supabase
    .from('agent_memory')
    .select('id, content, type, source, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (mError) console.error('Memory Error:', mError)
  else console.log('Memories found:', memories?.length || 0, memories)
}

checkData()
