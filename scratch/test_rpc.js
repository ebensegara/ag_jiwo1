const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = 'https://liqwjrzrcpdwhvpqitvh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXdqcnpyY3Bkd2h2cHFpdHZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExNjMwMiwiZXhwIjoyMDc4NjkyMzAyfQ.wRjR3wrm6w49-zX96LAmyLxNvCIfuvU_W9rCgc6TFsc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log('Testing RPC match_workshops...');
  // Passing a dummy zero vector
  const zeroVector = new Array(1536).fill(0);
  const { data, error } = await supabase.rpc('match_workshops', {
    query_embedding: `[${zeroVector.join(',')}]`,
    match_threshold: 0,
    match_count: 1
  });

  if (error) {
    console.error('RPC Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('RPC Success! Data:', data);
  }
}

testRpc();
