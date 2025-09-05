import { NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/google';
import { normalizeGoogle } from '@/lib/normalize-google';
import { GOOGLE_PLACES } from '@/data/google-places';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const entries = Object.entries(GOOGLE_PLACES); // [slug, placeId][]
    const all: any[] = [];

    // Sequential to be gentle with quotas; parallelize if needed.
    for (const [slug, placeId] of entries) {
      try {
        const details = await getPlaceDetails(placeId);
        if (details?.status && details.status !== 'OK') continue;

        const name = details?.result?.name ?? slug.replace(/-/g, ' ');
        const normalized = normalizeGoogle(name, placeId, details);
        all.push(...normalized);
      } catch {
        // Ignore a single place failure; continue with others
      }
    }

    return NextResponse.json({ reviews: all, source: 'google' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch google/all' }, { status: 500 });
  }
}
