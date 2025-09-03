'use client';

import { SelectField, SelectItem } from '@/components/ui/Select';
import type { Filters } from '../types';

type Props = {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  allProperties: string[];
  allChannels: string[];
  showCharts: boolean;
  setShowCharts: (b: boolean) => void;
};

export default function FiltersBar({
  filters, setFilters, allProperties, allChannels, showCharts, setShowCharts,
}: Props) {
  const { property, channel, status, dateFrom, dateTo, minRating } = filters;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm relative z-20">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        <SelectField label="Property" value={property} onValueChange={(v)=>setFilters({property: v})}>
          {allProperties.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectField>

        <SelectField label="Channel" value={channel} onValueChange={(v)=>setFilters({channel: v})}>
          {allChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectField>

        <SelectField label="Status" value={status} onValueChange={(v)=>setFilters({status: v as any})}>
          {['all','approved','denied','pending'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectField>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-600 dark:text-neutral-300">From</div>
          <input
            type="date" value={dateFrom} onChange={e=>setFilters({dateFrom: e.target.value})}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
        </label>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-600 dark:text-neutral-300">To</div>
          <input
            type="date" value={dateTo} onChange={e=>setFilters({dateTo: e.target.value})}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
        </label>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-600 dark:text-neutral-300">Min Rating</div>
          <input
            type="number" min={0} max={10} step={0.5}
            value={minRating} onChange={e=>setFilters({minRating: Number(e.target.value)})}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
        </label>

        <div className="flex items-end">
          <button
            onClick={() => setFilters({ property: 'all', channel: 'all', status: 'all', dateFrom: '', dateTo: '', minRating: 0 })}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input id="hc" type="checkbox" checked={showCharts} onChange={e=>setShowCharts(e.target.checked)} />
        <label htmlFor="hc" className="text-sm">Show historical charts</label>
      </div>
    </section>
  );
}
