type Normalized = {
  id: string;
  source: 'hostaway';
  listingId?: string;
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

/**
 * Accepts either your mock row shape or Hostaway API row shape
 * and returns a stable, frontend-friendly schema.
 */
export function normalizeReviews(rows: any[]): Normalized[] {
  return (rows || []).map((r: any) => {
    const id = String(r.id ?? r.reviewId ?? crypto.randomUUID());

    // review type / role
    const roleRaw = r.type ?? r.reviewType ?? '';
    const role: 'guest-to-host' | 'host-to-guest' =
      roleRaw === 'host-to-guest' || roleRaw === 'guest-to-host' ? roleRaw : 'guest-to-host';

    // status
    const statusRaw = (r.status ?? '').toString();
    const status: 'published' | 'draft' | 'hidden' =
      statusRaw === 'draft' || statusRaw === 'hidden' ? (statusRaw as any) : 'published';

    // channel
    const channelRaw = (r.channel ?? r.source ?? 'other').toString().toLowerCase();
    const channel: 'airbnb' | 'booking' | 'direct' | 'google' | 'other' =
      ['airbnb', 'booking', 'direct', 'google', 'other'].includes(channelRaw)
        ? (channelRaw as any)
        : 'other';

    // category ratings (normalize from various field names)
    const cats = Array.isArray(r.reviewCategory)
      ? r.reviewCategory
      : Array.isArray(r.categories)
      ? r.categories
      : [];

    const ratingsByCategory = cats
      .filter((c: any) => c && (c.name || c.category) && typeof c.rating === 'number')
      .map((c: any) => ({
        category: String(c.name ?? c.category).toLowerCase(),
        rating: Number(c.rating),
      }));

    // overall rating if present
    const ratingOverall =
      typeof r.rating === 'number'
        ? r.rating
        : typeof r.overall === 'number'
        ? r.overall
        : null;

    // listing info
    const listingName = r.listingName ?? r.propertyName ?? r.listing_title ?? undefined;
    const listingId = r.listingId ?? r.propertyId ?? undefined;

    // reviewer/guest name
    const reviewerName = r.guestName ?? r.reviewerName ?? r.author_name ?? 'Guest';

    // text/comment
    const text = r.publicReview ?? r.comment ?? r.text ?? '';

    // date
    const submittedAt = new Date(r.submittedAt ?? r.createdAt ?? r.time ?? Date.now()).toISOString();

    return {
      id: `hostaway-${id}`,
      source: 'hostaway',
      listingId,
      listingName,
      reviewerName,
      role,
      status,
      ratingOverall,
      ratingsByCategory,
      channel,
      submittedAt,
      text,
    };
  });
}
