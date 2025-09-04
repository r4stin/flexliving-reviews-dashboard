import { getBaseUrl } from '@/lib/get-base-url';

async function getApproved() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/reviews/approved`, { cache: 'no-store' as any });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.reviews ?? []) as any[];
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default async function PropertiesIndex() {
  const approved = await getApproved();
  const map = new Map<string, { name: string; count: number }>();
  for (const r of approved) {
    if (!r.listingName) continue;
    const slug = slugify(r.listingName);
    const item = map.get(slug) ?? { name: r.listingName, count: 0 };
    item.count++;
    map.set(slug, item);
  }
  const items = Array.from(map.entries());

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          No properties with approved reviews yet. Approve reviews in the Dashboard first.
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map(([slug, v]) => (
            <li key={slug} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-sm text-neutral-500">{v.count} approved review{v.count>1?'s':''}</div>
              </div>
              <a
                href={`/properties/${slug}`}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                View page
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
