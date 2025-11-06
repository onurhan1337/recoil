import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('credits, last_reset')
      .eq('user_id', user.id)
      .single();

    if (usageError) {
      if (usageError.code === 'PGRST116') {
        const { data: newUsage, error: insertError } = await supabase
          .from('usage')
          .insert({
            user_id: user.id,
            credits: 100,
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { error: 'Failed to initialize usage', details: insertError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          credits: newUsage.credits,
          last_reset: newUsage.last_reset,
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch usage', details: usageError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      credits: usage.credits,
      last_reset: usage.last_reset,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { data: usage, error: resetError } = await supabase
      .from('usage')
      .update({
        credits: 100,
        last_reset: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (resetError) {
      return NextResponse.json(
        { error: 'Failed to reset credits', details: resetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      credits: usage.credits,
      last_reset: usage.last_reset,
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
