import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reviewId, approved, approvedBy } = body ?? {};

    if (!reviewId || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('approvals')
      .upsert({
        review_id: reviewId,
        approved,
        approved_by: approvedBy ?? 'manager'
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const reviewId = searchParams.get('reviewId');
  if (!reviewId) {
    return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('approvals').delete().eq('review_id', reviewId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to approve/deny and DELETE to set pending',
    examples: {
      POST: { reviewId: 'id', approved: true },
      DELETE: '/api/reviews/approve?reviewId=id'
    }
  });
}
