const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSeed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Testing art_workshops access...')
  const { data, error } = await supabase
    .from('art_workshops')
    .select('id, title, description')
    .limit(1)

  if (error) {
    console.error('Error fetching art_workshops:', error)
    return
  }
  console.log('Success! Data:', data)

  console.log('Testing match_workshops RPC...')
  const { data: rpcData, error: rpcError } = await supabase.rpc('match_workshops', {
    query_embedding: new Array(1536).fill(0),
    match_threshold: 0,
    match_count: 1
  })

  if (rpcError) {
    console.error('Error calling match_workshops RPC:', rpcError)
  } else {
    console.log('RPC Success! Data:', rpcData)
  }
}

testSeed()
