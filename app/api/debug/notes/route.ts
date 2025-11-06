import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, content, embedding, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notesError) {
      return NextResponse.json({ error: notesError.message }, { status: 500 });
    }

    return NextResponse.json({
      user_id: user.id,
      notes_count: notes?.length || 0,
      notes: notes?.map(n => ({
        id: n.id,
        content: n.content.substring(0, 200),
        has_embedding: !!n.embedding,
        embedding_length: n.embedding ? n.embedding.length : 0,
        created_at: n.created_at
      }))
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
