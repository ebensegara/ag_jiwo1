import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createEmbedding } from '@/lib/memory'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Fetch all workshops that don't have embeddings
    const { data: workshops, error: fetchError } = await supabase
      .from('art_workshops')
      .select('id, title, description')
      .is('embedding', null)

    if (fetchError) throw fetchError
    if (!workshops || workshops.length === 0) {
      return NextResponse.json({ message: 'No workshops need embeddings' })
    }

    console.log(`[seed-embeddings] Found ${workshops.length} workshops to process.`)

    // 2. Generate embeddings and update
    const results = []
    for (const workshop of workshops) {
      const textToEmbed = `${workshop.title}. ${workshop.description}`
      const embedding = await createEmbedding(textToEmbed)

      const { error: updateError } = await supabase
        .from('art_workshops')
        .update({ embedding })
        .eq('id', workshop.id)

      if (updateError) {
        results.push({ id: workshop.id, status: 'error', error: updateError.message })
      } else {
        results.push({ id: workshop.id, status: 'success' })
      }
    }

    return NextResponse.json({
      message: 'Processing complete',
      processed: results.length,
      details: results
    })

  } catch (error: any) {
    console.error('[seed-embeddings] Critical error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      details: error.details || error.hint || 'No additional details'
    }, { status: 500 })
  }
}
