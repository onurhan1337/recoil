import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/embeddings';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || 'reading list';

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    console.log('Query:', query);
    console.log('Embedding length:', queryEmbedding.length);
    console.log('First 10 values:', queryEmbedding.slice(0, 10));

    // Search notes
    const { data: results, error: searchError } = await supabase.rpc(
      'search_notes',
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: config.search.matchThreshold,
        match_count: config.search.matchCount,
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json({
        error: searchError.message,
        details: searchError
      }, { status: 500 });
    }

    return NextResponse.json({
      query,
      threshold: config.search.matchThreshold,
      match_count: config.search.matchCount,
      embedding_length: queryEmbedding.length,
      results_count: results?.length || 0,
      results: results?.map((r: any) => ({
        id: r.id,
        content: r.content.substring(0, 200),
        similarity: r.similarity,
        similarity_percent: (r.similarity * 100).toFixed(2) + '%'
      }))
    });
  } catch (error: any) {
    console.error('Error in search debug:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
