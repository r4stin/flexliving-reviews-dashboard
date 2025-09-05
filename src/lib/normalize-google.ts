export type NormalizedReview = {
  id: string;
  source: 'google';
  listingName?: string;
  reviewerName: string;
  role: 'guest-to-host' | 'host-to-guest';
  status: 'published' | 'draft' | 'hidden';
  ratingOverall: number | null;
  ratingsByCategory: { category: string; rating: number }[];
  channel?: 'google';
  submittedAt: string; // ISO
  text: string;
  attribution?: {
    author_url?: string;
    poweredBy: 'google';
  };
};

export function normalizeGoogle(placeName: string, placeId: string, payload: any): NormalizedReview[] {
  const out: NormalizedReview[] = [];
  const reviews: any[] = payload?.result?.reviews ?? [];

  for (const r of reviews) {
    const when = (r?.time ? new Date((r.time as number) * 1000) : new Date());
    out.push({
      id: `google-${placeId}-${r?.time ?? Math.random().toString(36).slice(2)}`,
      source: 'google',
      listingName: placeName,
      reviewerName: r?.author_name || 'Google User',
      role: 'guest-to-host',      // everything public is “guest” perspective
      status: 'published',
      ratingOverall: typeof r?.rating === 'number' ? r.rating : null,
      ratingsByCategory: [],      // Google doesn’t provide category breakdown
      channel: 'google',
      submittedAt: when.toISOString(),
      text: r?.text || '',
      attribution: {
        author_url: r?.author_url,
        poweredBy: 'google',
      },
    });
  }

  return out;
}
