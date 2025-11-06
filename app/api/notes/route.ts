import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/embeddings';
import { noteSchema } from '@/lib/validations';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = noteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    const noteCost = config.credits.costs.createNote;

    if (usageError || !usage || usage.credits < noteCost) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: noteCost,
          available: usage?.credits || 0,
        },
        { status: 403 }
      );
    }

    const embedding = await generateEmbedding(content);

    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        content,
        embedding: JSON.stringify(embedding),
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json(
        { error: 'Failed to create note', details: noteError.message },
        { status: 500 }
      );
    }

    const { error: creditError } = await supabase
      .from('usage')
      .update({ credits: usage.credits - noteCost })
      .eq('user_id', user.id);

    if (creditError) {
      console.error('Failed to decrement credits:', creditError);
    }

    return NextResponse.json({
      note,
      credits_remaining: usage.credits - noteCost,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (notesError) {
      return NextResponse.json(
        { error: 'Failed to fetch notes', details: notesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
