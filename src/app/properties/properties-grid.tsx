'use client';

import { useMemo, useState } from 'react';
import type { PropertyCardItem } from './page';
import { SelectField, SelectItem } from '@/components/ui/Select';

type SortKey =
  | 'rating_desc' | 'rating_asc'
  | 'newest' | 'oldest'
  | 'reviews_desc' | 'reviews_asc'
  | 'name_asc';

export default function PropertiesGrid({
  items = [], years = [], channels = [],
}: {
  items?: PropertyCardItem[];
  years?: number[];
  channels?: string[];
}) {
  const [minStars, setMinStars] = useState<number>(0);
  const [year, setYear] = useState<string>('all');
  const [channel, setChannel] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('rating_desc');
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo(() => {
    return (items ?? []).filter(i => {
      if (minStars > 0 && (i.avg ?? 0) < minStars) return false;

      if (year !== 'all') {
        const y = new Date(i.latestISO).getFullYear().toString();
        if (y !== year) return false;
      }

      if (channel !== 'all') {
        if (!i.channels.includes(channel)) return false;
      }

      if (query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        if (!i.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [items, minStars, year, channel, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'rating_desc':
        arr.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
        break;
      case 'rating_asc':
        arr.sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999));
        break;
      case 'newest':
        arr.sort((a, b) => +new Date(b.latestISO) - +new Date(a.latestISO));
        break;
      case 'oldest':
        arr.sort((a, b) => +new Date(a.latestISO) - +new Date(b.latestISO));
        break;
      case 'reviews_desc':
        arr.sort((a, b) => b.count - a.count);
        break;
      case 'reviews_asc':
        arr.sort((a, b) => a.count - b.count);
        break;
      case 'name_asc':
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return arr;
  }, [filtered, sort]);

  const reset = () => {
    setMinStars(0);
    setYear('all');
    setChannel('all');
    setSort('rating_desc');
    setQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="relative z-30 isolate rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search by name */}
          <label className="text-sm block">
            <div className="mb-1 text-neutral-600 dark:text-neutral-300">Search</div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Property name…"
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2"
            />
          </label>

          <SelectField label="Property rating" value={String(minStars)} onValueChange={(v)=>setMinStars(Number(v))}>
            <SelectItem value="0">All ratings</SelectItem>
            <SelectItem value="9">9.0+</SelectItem>
            <SelectItem value="8">8.0+</SelectItem>
            <SelectItem value="7">7.0+</SelectItem>
            <SelectItem value="6">6.0+</SelectItem>
            <SelectItem value="5">5.0+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="3">3.0+</SelectItem>
            <SelectItem value="2">2.0+</SelectItem>
            <SelectItem value="1">1.0+</SelectItem>
          </SelectField>

          <SelectField label="Year" value={year} onValueChange={setYear}>
            <SelectItem value="all">All years</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectField>


          <SelectField label="Channel" value={channel} onValueChange={setChannel}>
            <SelectItem value="all">All channels</SelectItem>
            {channels.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectField>

          <SelectField label="Sort by" value={sort} onValueChange={(v)=>setSort(v as SortKey)}>
            <SelectItem value="rating_desc">Highest rating</SelectItem>
            <SelectItem value="rating_asc">Lowest rating</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="reviews_desc">Most reviews</SelectItem>
            <SelectItem value="reviews_asc">Fewest reviews</SelectItem>
            <SelectItem value="name_asc">Name (A→Z)</SelectItem>
          </SelectField>

          <div className="flex items-end">
            <button
              onClick={reset}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          No properties match your filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(p => (
            <a
              key={p.slug}
              href={`/properties/${p.slug}`}
              className="group rounded-xl overflow-hidden shadow-lg cursor-pointer transition-shadow hover:shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"

              style={{ backgroundColor: 'rgb(255, 253, 246)' }}
            >
              {/* Image with rating badge */}
              <div className="relative">
                <div className="relative pb-[56.25%]">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Rating badge (top-right) */}
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

                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'rgb(92, 92, 90)' }}>
                    {p.count} review{p.count > 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-1">
                    {p.channels.slice(0, 3).map(c => (
                      <span
                        key={c}
                        className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 text-[10px]"
                        title={c}
                      >
                        {c}
                      </span>
                    ))}
                    {p.channels.length > 3 && (
                      <span className="text-[10px] text-neutral-500">+{p.channels.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
