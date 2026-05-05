const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://liqwjrzrcpdwhvpqitvh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXdqcnpyY3Bkd2h2cHFpdHZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExNjMwMiwiZXhwIjoyMDc4NjkyMzAyfQ.wRjR3wrm6w49-zX96LAmyLxNvCIfuvU_W9rCgc6TFsc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRpc() {
  console.log('--- CHECKING RPC PARAMETERS ---')
  const { data, error } = await supabase.rpc('get_rpc_params', { rpc_name: 'remember_with_embedding' })
  // Since I don't have get_rpc_params, I'll try to run a raw SQL if possible via a known RPC or just use a dummy call to see error
  
  try {
    const { error: rpcError } = await supabase.rpc('remember_with_embedding', {
        p_user_id: '047f4eb1-771d-4d40-b468-58f7e9319000',
        p_content: 'test',
        p_embedding: Array(768).fill(0),
        p_type: 'event',
        p_importance: 1,
        p_source: 'test',
        p_metadata: {}
    })
    if (rpcError) {
        console.log('RPC Error (with all params):', rpcError.message)
    } else {
        console.log('RPC Success with all params')
    }
  } catch (e) {
    console.error('Catch Error:', e)
  }
}

checkRpc()
