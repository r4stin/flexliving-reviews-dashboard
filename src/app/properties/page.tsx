import { getBaseUrl } from '@/lib/get-base-url';
import { LISTING_IMAGES } from '@/data/listing-images';
import PropertiesGrid from './properties-grid';

type Review = {
  id: string;
  listingName?: string;
  ratingOverall: number | null;
  ratingsByCategory?: { category: string; rating: number }[];
  submittedAt: string;
  text: string;
  channel?: 'airbnb' | 'booking' | 'direct' | 'google' | 'other';
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

async function getApproved(): Promise<Review[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/reviews/approved`, { cache: 'no-store' as any });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.reviews ?? []) as Review[];
}

function average(nums: number[]) {
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return +(sum / nums.length).toFixed(1);
}

function computedRating(r: Review): number | null {
  if (typeof r.ratingOverall === 'number') return r.ratingOverall;
  const cats = (r.ratingsByCategory ?? []).map(c => c.rating).filter(n => typeof n === 'number');
  return cats.length ? average(cats) : null;
}

export type PropertyCardItem = {
  slug: string;
  name: string;
  image: string;
  avg: number | null;
  count: number;
  channels: string[];
  latestISO: string;
};

export default async function PropertiesIndex() {
  const approved = await getApproved();

  const map = new Map<string, {
    name: string;
    slug: string;
    ratings: number[];
    count: number;
    channels: Set<string>;
    latestISO: string | null;
  }>();

  for (const r of approved) {
    if (!r.listingName) continue;
    const slug = slugify(r.listingName);
    const rating = computedRating(r);
    const cur = map.get(slug) ?? {
      name: r.listingName,
      slug,
      ratings: [],
      count: 0,
      channels: new Set<string>(),
      latestISO: null,
    };

    if (rating != null) cur.ratings.push(rating);
    cur.count += 1;
    if (r.channel) cur.channels.add(r.channel);
    const ts = new Date(r.submittedAt).toISOString();
    if (!cur.latestISO || ts > cur.latestISO) cur.latestISO = ts;

    map.set(slug, cur);
  }

  const items: PropertyCardItem[] = Array.from(map.values())
    .map(p => ({
      slug: p.slug,
      name: p.name,
      image: LISTING_IMAGES[p.slug] ?? '/placeholder.jpg',
      avg: p.ratings.length ? average(p.ratings) : null,
      count: p.count,
      channels: Array.from(p.channels).sort(),
      latestISO: p.latestISO ?? new Date(0).toISOString(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const years = Array.from(
    new Set(items.map(i => new Date(i.latestISO).getFullYear()).filter(n => n > 1970))
  ).sort((a, b) => b - a);

  const channelSet = new Set<string>();
  items.forEach(i => i.channels.forEach(c => channelSet.add(c)));
  const channels = Array.from(channelSet).sort();

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
  
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Explore what our guests have to say about each property.
        </p>
      </header>

      <PropertiesGrid
        items={items}
        years={years}
        channels={channels}
      />
    </div>
  );
}
