import { NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/google';
import { normalizeGoogle } from '@/lib/normalize-google';
import { GOOGLE_PLACES } from '@/data/google-places';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // you can call either with ?placeId=... (direct) or ?slug=... (lookup)
    const placeIdParam = searchParams.get('placeId');
    const slugParam = searchParams.get('slug');

    let placeId = placeIdParam ?? undefined;
    let listingName = 'Google Place';

    if (!placeId && slugParam) {
      placeId = GOOGLE_PLACES[slugParam];
      listingName = slugParam.replace(/-/g, ' ');
    }

    if (!placeId) {
      return NextResponse.json(
        { error: 'Provide a placeId or a slug that maps to a Place ID' },
        { status: 400 }
      );
    }

    const data = await getPlaceDetails(placeId);
    if (data?.status && data.status !== 'OK') {
      return NextResponse.json(
        { error: `Google status: ${data.status}`, details: data?.error_message },
        { status: 502 }
      );
    }

    // name from google if available
    const finalName = data?.result?.name ?? listingName;

    const normalized = normalizeGoogle(finalName, placeId, data);

    // Optional: include aggregate rating for the property
    const aggregate = {
      name: finalName,
      rating: data?.result?.rating ?? null,
      total: data?.result?.user_ratings_total ?? null,
      url: data?.result?.url ?? null,
    };

    return NextResponse.json({ reviews: normalized, aggregate, source: 'google' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch Google reviews' }, { status: 500 });
  }
}
