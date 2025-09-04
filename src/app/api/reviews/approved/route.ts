import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

type NormalizedReview = {
  id: string;
  source: 'hostaway' | 'google';
  listingName?: string;
  reviewerName: string;
  role: 'guest-to-host' | 'host-to-guest';
  status: 'published' | 'draft' | 'hidden';
  ratingOverall: number | null;
  ratingsByCategory: { category: string; rating: number }[];
  channel?: 'airbnb' | 'booking' | 'direct' | 'google' | 'other';
  submittedAt: string;
  text: string;
};

export async function GET(req: Request) {
  try {
    // 1) Fetch ALL reviews from our normalized Hostaway endpoint (which already
    //    handles live Hostaway + mock fallback).
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.length > 0
        ? process.env.NEXT_PUBLIC_BASE_URL
        : new URL(req.url).origin;

    const res = await fetch(`${origin}/api/reviews/hostaway`, { cache: 'no-store' as any });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Upstream /api/reviews/hostaway failed: ${txt || res.status}`);
    }

    const json = await res.json();
    const all: NormalizedReview[] = json?.reviews ?? [];

    // 2) Get approvals map from Supabase
    const { data: approvals, error } = await supabaseAdmin
      .from('approvals')
      .select('review_id, approved');

    if (error) throw error;

    const approvedIds = new Set((approvals ?? []).filter(a => a.approved).map(a => a.review_id));

    // 3) Only return approved reviews
    const reviews = all.filter(r => approvedIds.has(r.id));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Unknown error fetching approved reviews' },
      { status: 500 }
    );
  }
}
