export type Review = {
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

export type ApprovalRow = {
  review_id: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
};

export type Status = 'approved' | 'denied' | 'pending';

export type SortKey = 'date' | 'rating' | 'channel' | 'listing' | 'status';

export type Filters = {
  property: string;
  channel: string;
  status: 'all' | Status;
  dateFrom: string; // yyyy-mm-dd
  dateTo: string;   // yyyy-mm-dd
  minRating: number;
  category?: 'all' | string;
};

export type TimeseriesPoint = { day: string; avg: number | null };
export type ChannelRow = { name: string; count: number };
