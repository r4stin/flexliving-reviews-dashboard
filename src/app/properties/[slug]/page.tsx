import { notFound } from 'next/navigation';
import { getBaseUrl } from '@/lib/get-base-url';


// --- helpers ---
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

async function getApproved() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/reviews/approved`, { cache: 'no-store' as any });
  if (!res.ok) return [];
  const json = await res.json();
  return json.reviews as any[];
}
// Small star rating chip (shows only if ratingOverall exists)
function StarChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-300/20 dark:text-yellow-200 px-2 py-0.5 text-xs font-medium">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden className="opacity-80">
        <path d="M10 1.5l2.62 5.31 5.86.85-4.24 4.14 1 5.8L10 14.98 4.76 17.6l1-5.8L1.5 7.66l5.86-.85L10 1.5z" />
      </svg>
      {value.toFixed(1)}
    </span>
  );
}

export default async function PropertyPage({
  params,
}: {
  // Next.js 15 server components: params is a Promise
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const approved = await getApproved();
  const list = approved.filter((r) =>
    r.listingName ? slugify(r.listingName) === slug : false
  );

  if (!approved.length) {
    // nothing in the system at all (unlikely in your mock)
    notFound();
  }

  // page title: prefer the normalized listing name if present
  const title = list[0]?.listingName ?? decodeURIComponent(slug);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Header / hero strip */}
      <header className="space-y-3">
        <nav className="text-sm text-neutral-500">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-1">/</span>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <span className="mx-1">/</span>
          <span className="text-neutral-700 dark:text-neutral-300">{title}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Flex Living · Property details
          </span>
          {list.length > 0 && (
            <>
              <span className="opacity-40">•</span>
              <span>{list.length} approved review{list.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </header>

      {/* Reviews section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Guest reviews</h2>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 text-neutral-600 dark:text-neutral-300">
            No approved reviews yet. Once a manager approves reviews in the dashboard, they’ll appear here.
          </div>
        ) : (
          <div className="grid gap-4">
            {list.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{r.reviewerName}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(r.submittedAt).toLocaleDateString()} · {r.channel ?? 'other'}
                    </div>
                  </div>
                  {typeof r.ratingOverall === 'number' && <StarChip value={r.ratingOverall} />}
                </div>

                <p className="mt-3 text-sm leading-6">{r.text}</p>

                {/* Per-category scores if available */}
                {Array.isArray(r.ratingsByCategory) && r.ratingsByCategory.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.ratingsByCategory.map((c: any) => (
                      <span
                        key={c.category}
                        className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700
                                   bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 text-xs"
                      >
                        {c.category}: {c.rating}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
