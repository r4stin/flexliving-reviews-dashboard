'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApprovalRow } from '../types';

export default function useApprovals() {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/approvals', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load approvals');
      const json = await res.json();
      const list = (json.approvals ?? []) as ApprovalRow[];
      const map = new Map<string, boolean>();
      list.forEach(a => map.set(a.review_id, a.approved));
      return map; // Map<review_id, approved>
    },
  });
}
