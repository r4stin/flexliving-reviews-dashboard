// src/app/api/reviews/approved/route.ts
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
  submittedAt: string; // ISO
  text: string;
};

function isReviewArray(x: unknown): x is NormalizedReview[] {
  return Array.isArray(x);
}

export async function GET(req: Request) {
  try {
    // Determine origin (works on Vercel + local)
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.length > 0
        ? process.env.NEXT_PUBLIC_BASE_URL
        : new URL(req.url).origin;

    // 1) Pull normalized Hostaway (live-or-mock) reviews
    const hostawayRes = await fetch(`${origin}/api/reviews/hostaway`, { cache: 'no-store' as any });
    if (!hostawayRes.ok) {
      const txt = await hostawayRes.text().catch(() => '');
      throw new Error(`Upstream /api/reviews/hostaway failed: ${txt || hostawayRes.status}`);
    }
    const hostawayJson = (await hostawayRes.json()) as { reviews?: unknown };
    const hostawayReviews = isReviewArray(hostawayJson?.reviews) ? hostawayJson.reviews : [];

    // 2) Try to pull normalized Google reviews (optional—ignore failures)
    let googleReviews: NormalizedReview[] = [];
    try {
      const googleRes = await fetch(`${origin}/api/reviews/google/all`, { cache: 'no-store' as any });
      if (googleRes.ok) {
        const googleJson = (await googleRes.json()) as { reviews?: unknown };
        if (isReviewArray(googleJson?.reviews)) {
          googleReviews = googleJson.reviews;
        }
      }
    } catch {
      // ignore — keep googleReviews as []
    }

    // 3) Merge sources
    const all: NormalizedReview[] = [...hostawayReviews, ...googleReviews];

    // 4) Get approvals map from Supabase
    const { data: approvals, error } = await supabaseAdmin
      .from('approvals')
      .select('review_id, approved');

    if (error) throw error;

    const approvedIds = new Set(
      (approvals ?? [])
        .filter((a) => a.approved)
        .map((a) => a.review_id)
    );

    // 5) Only return approved reviews (source-agnostic)
    const reviews = all.filter((r) => approvedIds.has(r.id));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error fetching approved reviews';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
