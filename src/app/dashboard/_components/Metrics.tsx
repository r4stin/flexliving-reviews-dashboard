'use client';

import { Card, CardTitle, CardValue } from '@/components/ui/Card';

type Props = {
  avgRating: number | null;
  total: number;
  approvalRate: number | null;
  topChannel?: { channel: string; count: number } | null;
};

export default function Metrics({ avgRating, total, approvalRate, topChannel }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card><CardTitle>Average Rating</CardTitle><CardValue>{avgRating ?? '—'}</CardValue></Card>
      <Card><CardTitle>Reviews</CardTitle><CardValue>{total}</CardValue></Card>
      <Card><CardTitle>Approval Rate</CardTitle><CardValue>{approvalRate != null ? `${approvalRate}%` : '—'}</CardValue></Card>
      <Card><CardTitle>Top Channel</CardTitle><CardValue>{topChannel ? `${topChannel.channel} (${topChannel.count})` : '—'}</CardValue></Card>
    </section>
  );
}
