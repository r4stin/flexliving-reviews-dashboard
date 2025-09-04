import { getBaseUrl } from '@/lib/get-base-url';
import { LISTING_IMAGES } from '@/data/listing-images';

type Review = {
  id: string;
  listingName?: string;
  ratingOverall: number | null;
  ratingsByCategory?: { category: string; rating: number }[];
  submittedAt: string;
  text: string;
  channel?: string;
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

export default async function PropertiesIndex() {
  const approved = await getApproved();

  // Aggregate approved reviews by property
  const map = new Map<string, {
    name: string;
    slug: string;
    count: number;
    avg: number | null;
  }>();

  for (const r of approved) {
    if (!r.listingName) continue;
    const slug = slugify(r.listingName);
    const rating = computedRating(r);
    const cur = map.get(slug) ?? { name: r.listingName, slug, count: 0, avg: null };

    // accumulate avg as a simple mean of available ratings
    const mergeVals: number[] = [];
    if (cur.avg != null) mergeVals.push(cur.avg);
    if (rating != null) mergeVals.push(rating);

    map.set(slug, {
      name: r.listingName,
      slug,
      count: cur.count + 1,
      avg: mergeVals.length ? average(mergeVals) : cur.avg ?? rating ?? null,
    });
  }

  const items = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Explore what our guests have to say about each property.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          No properties with approved reviews yet. Approve reviews in the Dashboard first.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const img = LISTING_IMAGES[p.slug] ?? '/placeholder.jpg';
            return (
              <a
                key={p.slug}
                href={`/properties/${p.slug}`}
                className="group rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                style={{ backgroundColor: 'rgb(255, 253, 246)' }} // subtle warm like Flex
              >
                {/* Image area with 16:9 aspect */}
                <div className="relative">
                  <div className="relative pb-[56.25%]"> {/* 16:9 */}
                    <img
                      src={img}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* Rating badge (top-left) */}
                    {typeof p.avg === 'number' && (
                      <div className="absolute top-2 right-1">
                        <div
                          className="backdrop-blur-sm rounded-md shadow-lg border px-1.5 py-0.5"
                          style={{
                            backgroundColor: 'rgba(255, 253, 246, 0.94)',
                            borderColor: 'rgba(92, 92, 90, 0.125)',
                          }}
                        >
                          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'rgb(40, 78, 76)' }}>
                            {/* star icon */}
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden className="opacity-80">
                              <path d="M10 1.5l2.62 5.31 5.86.85-4.24 4.14 1 5.8L10 14.98 4.76 17.6l1-5.8L1.5 7.66l5.86-.85L10 1.5z" />
                            </svg>
                            {p.avg.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold break-words hyphens-auto mb-1" style={{ color: 'rgb(51, 51, 51)' }}>
                    {p.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'rgb(92, 92, 90)' }}>
                    {p.count} approved review{p.count > 1 ? 's' : ''}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
