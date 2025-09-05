'use client';

import { useQuery } from '@tanstack/react-query';
import type { Review } from '../types';

export default function useGoogleReviews(enabled: boolean) {
  return useQuery({
    queryKey: ['google-reviews', { enabled }],
    queryFn: async (): Promise<Review[]> => {
      const res = await fetch('/api/reviews/google/all', { cache: 'no-store' as any });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.reviews ?? []) as Review[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 mins
    refetchOnWindowFocus: false,
  });
}
