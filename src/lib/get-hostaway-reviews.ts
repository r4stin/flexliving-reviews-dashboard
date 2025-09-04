import { normalizeReviews } from '@/lib/normalize-reviews';
import mock from '@/data/hostaway-mock.json';
import { getHostawayToken } from '@/lib/hostaway';

export type NormalizedReview = {
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

export async function getHostawayReviews(): Promise<{ reviews: NormalizedReview[]; source: 'mock' | 'hostaway' }> {
  try {
    let reviewsRaw: any[] = (mock as any)?.reviews ?? (Array.isArray(mock) ? (mock as any[]) : []);
    let source: 'mock' | 'hostaway' = 'mock';

    // Try live token
    const token = await getHostawayToken();
    if (token) {
      const res = await fetch('https://api.hostaway.com/v1/reviews', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        // @ts-expect-error – Next runtime option
        cache: 'no-store',
      });
      if (res.ok) {
        const apiJson = await res.json();
        const list = Array.isArray(apiJson?.result) ? apiJson.result : [];
        if (list.length > 0) {
          reviewsRaw = list;
          source = 'hostaway';
        }
      }
    }

    const reviews = normalizeReviews(reviewsRaw);
    return { reviews, source };
  } catch {
    // Always return mocks on failure (keeps UI working)
    return { reviews: normalizeReviews((mock as any)?.reviews ?? []), source: 'mock' };
  }
}
