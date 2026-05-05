const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://liqwjrzrcpdwhvpqitvh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXdqcnpyY3Bkd2h2cHFpdHZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzExNjMwMiwiZXhwIjoyMDc4NjkyMzAyfQ.wRjR3wrm6w49-zX96LAmyLxNvCIfuvU_W9rCgc6TFsc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('Listing tables via introspection...');
  // This is a hacky way to see what's in the schema cache if we can run some SQL
  // But we can't run raw SQL. 
  // However, we can try to access some common tables.
  
  const tables = ['users', 'journals', 'moods', 'art_workshops', 'bookings'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`Table ${table}: ERROR - ${error.message} (${error.code})`);
    } else {
      console.log(`Table ${table}: OK`);
    }
  }
}

listTables();
