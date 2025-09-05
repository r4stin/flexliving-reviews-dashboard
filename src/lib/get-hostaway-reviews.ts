// src/lib/get-hostaway-reviews.ts
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
    // Start from mock (covers sandbox/no data)
    const mockArray =
      Array.isArray((mock as any)?.reviews)
        ? (mock as any).reviews
        : Array.isArray((mock as any)?.data)
        ? (mock as any).data
        : Array.isArray(mock as any)
        ? (mock as any as any[])
        : [];

    let raw: any[] = mockArray;
    let source: 'mock' | 'hostaway' = 'mock';

    // Try live Hostaway (optional)
    const token = await getHostawayToken();
    if (token) {
      const res = await fetch('https://api.hostaway.com/v1/reviews', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        cache: 'no-store', // valid RequestCache type, no suppression needed
      });
      if (res.ok) {
        const apiJson = await res.json();
        const list = Array.isArray(apiJson?.result) ? apiJson.result : [];
        if (list.length > 0) {
          raw = list;
          source = 'hostaway';
        }
      }
    }

    const reviews = normalizeReviews(raw);
    return { reviews, source };
  } catch {
    // Always return mocks on failure (keeps UI working)
    const fallback =
      Array.isArray((mock as any)?.reviews)
        ? (mock as any).reviews
        : Array.isArray((mock as any)?.data)
        ? (mock as any).data
        : Array.isArray(mock as any)
        ? (mock as any as any[])
        : [];
    return { reviews: normalizeReviews(fallback), source: 'mock' };
  }
}
