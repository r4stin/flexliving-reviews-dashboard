import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getHostawayReviews, type NormalizedReview } from '@/lib/get-hostaway-reviews';

export async function GET() {
  try {
    // 1) Pull normalized reviews without HTTP (avoids Vercel protection)
    const { reviews: all } = await getHostawayReviews();

    // 2) Load approvals from Supabase
    const { data: approvals, error } = await supabaseAdmin
      .from('approvals')
      .select('review_id, approved');

    if (error) throw error;

    const approvedIds = new Set(
      (approvals ?? []).filter(a => a.approved).map(a => a.review_id as string)
    );

    // 3) Filter approved-only
    const reviews: NormalizedReview[] = all.filter(r => approvedIds.has(r.id));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
