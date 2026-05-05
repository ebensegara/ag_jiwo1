const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to art_workshops...');
  const { data, error } = await supabase
    .from('art_workshops')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success! Data:', data);
  }
}

testConnection();
