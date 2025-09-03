'use client';

import { useQuery } from '@tanstack/react-query';
import type { Review } from '../types';

export default function useHostaway() {
  return useQuery({
    queryKey: ['hostaway'],
    queryFn: async (): Promise<Review[]> => {
      const res = await fetch('/api/reviews/hostaway');
      if (!res.ok) throw new Error('Failed to load reviews');
      const json = await res.json();
      return json.reviews as Review[];
    },
  });
}
