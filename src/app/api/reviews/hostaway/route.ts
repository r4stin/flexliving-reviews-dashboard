// app/api/reviews/hostaway/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // ensure Node runtime so we can use fs

type NormalizedReview = {
  id: string;
  source: 'hostaway';
  listingId?: string;
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

export async function GET() {
  try {
    // Read the mock file from /public
    const filePath = path.join(process.cwd(), 'public', 'mock', 'hostaway.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    const rows: any[] = Array.isArray(parsed) ? parsed : parsed?.data ?? [];

    const reviews: NormalizedReview[] = rows.map((r) => {
      // Defensive parsing with safe defaults
      const id = String(r.id ?? crypto.randomUUID());
      const type = (r.type === 'host-to-guest' || r.type === 'guest-to-host') ? r.type : 'guest-to-host';
      const status = (['published', 'draft', 'hidden'].includes(r.status)) ? r.status : 'published';
      const channel = String(r.channel ?? 'other').toLowerCase();

      const categories = Array.isArray(r.reviewCategory) ? r.reviewCategory : [];
      const ratingsByCategory = categories
        .filter((c: any) => c && c.name && typeof c.rating === 'number')
        .map((c: any) => ({ category: String(c.name).toLowerCase(), rating: Number(c.rating) }));

      const submittedAtISO = new Date(r.submittedAt ?? Date.now()).toISOString();

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
        submittedAt: submittedAtISO,
        text: r.publicReview ?? ''
      };
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to read or normalize hostaway.json', details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
