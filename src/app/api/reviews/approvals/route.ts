import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('approvals')
    .select('review_id, approved, approved_by, approved_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ approvals: data ?? [] });
}
