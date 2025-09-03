import type { Filters, Review, SortKey, Status } from '../types';
import { average } from '@/lib/ratings';

export function computedRating(r: Review) {
  return r.ratingOverall ?? (average(r.ratingsByCategory.map(c => c.rating)) ?? null);
}

export function getStatus(id: string, approvals?: Map<string, boolean>): Status {
  if (!approvals) return 'pending';
  if (!approvals.has(id)) return 'pending';
  return approvals.get(id) ? 'approved' : 'denied';
}

export function filterReviews(
  reviews: Review[],
  f: Filters,
  approvals?: Map<string, boolean>
) {
  return reviews.filter(r => {
    if (f.property !== 'all' && r.listingName !== f.property) return false;
    if (f.channel !== 'all' && r.channel !== (f.channel as any)) return false;

    const mr = computedRating(r) ?? 0;
    if (f.minRating > 0 && mr < f.minRating) return false;

    if (f.dateFrom && new Date(r.submittedAt) < new Date(f.dateFrom)) return false;

    if (f.dateTo) {
      const end = new Date(f.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(r.submittedAt) > end) return false;
    }

    if (f.status !== 'all' && getStatus(r.id, approvals) !== f.status) return false;

    return true;
  });
}

export function sortReviews(
  arr: Review[],
  key: SortKey,
  dir: 'asc' | 'desc',
  approvals?: Map<string, boolean>
) {
  const mul = dir === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => {
    switch (key) {
      case 'date':
        return mul * (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      case 'rating':
        return mul * (((computedRating(a) ?? -1) - (computedRating(b) ?? -1)));
      case 'channel':
        return mul * ((a.channel ?? '').localeCompare(b.channel ?? ''));
      case 'listing':
        return mul * ((a.listingName ?? '').localeCompare(b.listingName ?? ''));
      case 'status': {
        const sa = getStatus(a.id, approvals);
        const sb = getStatus(b.id, approvals);
        return mul * sa.localeCompare(sb);
      }
    }
  });
}

export function timeseriesAverage(reviews: Review[]) {
  const bucket: Record<string, number[]> = {};
  for (const r of reviews) {
    const day = r.submittedAt.slice(0, 10); // yyyy-mm-dd (fast path)
    const val = computedRating(r);
    if (val == null) continue;
    (bucket[day] ||= []).push(val);
  }
  const rows = Object.entries(bucket).map(([day, arr]) => ({
    day,
    avg: average(arr),
  }));
  rows.sort((a, b) => a.day.localeCompare(b.day));
  return rows;
}

export function channelDistribution(reviews: Review[]) {
  const counts: Record<string, number> = {};
  for (const r of reviews) {
    const c = r.channel ?? 'other';
    counts[c] = (counts[c] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}
