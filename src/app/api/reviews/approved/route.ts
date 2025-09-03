import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/db/supabase';

type NormalizedReview = {
  id: string;
  source: 'hostaway';
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

export const runtime = 'nodejs';

function normalize(rows: any[]): NormalizedReview[] {
  return rows.map((r) => {
    const id = String(r.id ?? crypto.randomUUID());
    const type = (r.type === 'host-to-guest' || r.type === 'guest-to-host') ? r.type : 'guest-to-host';
    const status = (['published','draft','hidden'].includes(r.status)) ? r.status : 'published';
    const channel = String(r.channel ?? 'other').toLowerCase();

    const categories = Array.isArray(r.reviewCategory) ? r.reviewCategory : [];
    const ratingsByCategory = categories
      .filter((c: any) => c && c.name && typeof c.rating === 'number')
      .map((c: any) => ({ category: String(c.name).toLowerCase(), rating: Number(c.rating) }));

    return {
      id: `hostaway-${id}`,
      source: 'hostaway',
      listingName: r.listingName ?? undefined,
      reviewerName: r.guestName ?? 'Guest',
      role: type,
      status,
      ratingOverall: (typeof r.rating === 'number' ? r.rating : null),
      ratingsByCategory,
      channel: (['airbnb','booking','direct','google','other'].includes(channel) ? channel : 'other') as any,
      submittedAt: new Date(r.submittedAt ?? Date.now()).toISOString(),
      text: r.publicReview ?? ''
    };
  });
}

export async function GET() {
  try {
    // 1) Read base reviews from the mock
    const filePath = path.join(process.cwd(), 'public', 'mock', 'hostaway.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const rows: any[] = Array.isArray(parsed) ? parsed : parsed?.data ?? [];
    const all = normalize(rows);

    // 2) Get approvals
    const { data: approvals, error } = await supabaseAdmin
      .from('approvals')
      .select('review_id, approved');

    if (error) throw error;

    const approvedIds = new Set((approvals ?? []).filter(a => a.approved).map(a => a.review_id));

    // 3) Return only approved reviews
    const reviews = all.filter(r => approvedIds.has(r.id));

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Unknown error' }, { status: 500 });
  }
}
