'use client';

import { useState } from 'react';
import { SelectField, SelectItem } from '@/components/ui/Select';
import type { Filters } from '../types';

type Props = {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  allProperties: string[];
  allChannels: string[];
  allCategories: string[];
  showIssuesPanel: boolean;
  setShowIssuesPanel: (b: boolean) => void;
  showHistoryPanel: boolean;
  setShowHistoryPanel: (b: boolean) => void;
};

export default function FiltersBar({
  filters, setFilters,
  allProperties, allChannels, allCategories,
  showIssuesPanel, setShowIssuesPanel,
  showHistoryPanel, setShowHistoryPanel,
}: Props) {
  const { property, channel, status, dateFrom, dateTo, minRating, category } = filters;

  // local UI state for lightweight “single control” date range popover
  const [openRange, setOpenRange] = useState(false);

  const prettyRange =
    dateFrom && dateTo
      ? `${new Date(dateFrom).toLocaleDateString()} – ${new Date(dateTo).toLocaleDateString()}`
      : dateFrom
      ? `${new Date(dateFrom).toLocaleDateString()} – …`
      : dateTo
      ? `… – ${new Date(dateTo).toLocaleDateString()}`
      : 'Any time';

  const resetAll = () =>
    setFilters({ property: 'all', channel: 'all', status: 'all', dateFrom: '', dateTo: '', minRating: 0, category: 'all' });

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm relative z-20">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {/* Property */}
        <SelectField label="Property" value={property} onValueChange={(v)=>setFilters({property: v})}>
          {allProperties.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectField>

        {/* Channel */}
        <SelectField label="Channel" value={channel} onValueChange={(v)=>setFilters({channel: v})}>
          {allChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectField>

        {/* Category */}
        <SelectField label="Category" value={category ?? 'all'} onValueChange={(v)=>setFilters({ category: v as any })}>
          <SelectItem value="all">all</SelectItem>
          {allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectField>

        {/* Status */}
        <SelectField label="Status" value={status} onValueChange={(v)=>setFilters({status: v as any})}>
          {['all','approved','denied','pending'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectField>

        {/* Date range (single control with popover) */}
        <div className="text-sm relative">
          <div className="mb-1 text-neutral-600 dark:text-neutral-300">Date range</div>
          <button
            type="button"
            onClick={() => setOpenRange(o => !o)}
            className="w-full min-h-10 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 px-3 py-2 text-left text-neutral-900 dark:text-neutral-100"
            aria-haspopup="dialog"
            aria-expanded={openRange}
            aria-label="Select date range"
          >
            {prettyRange}
          </button>

          {openRange && (
            <div
              className="absolute z-[1000] mt-2 w-[min(520px,90vw)] rounded-lg border
                         border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs block">
                  <div className="mb-1 text-neutral-600 dark:text-neutral-300">From</div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e=>setFilters({dateFrom: e.target.value})}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2"
                  />
                </label>
                <label className="text-xs block">
                  <div className="mb-1 text-neutral-600 dark:text-neutral-300">To</div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e=>setFilters({dateTo: e.target.value})}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFilters({ dateFrom: '', dateTo: '' })}
                  className="text-xs underline text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                >
                  Clear dates
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenRange(false)}
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Min Rating — switch to Select like /properties */}
        <SelectField label="Rating" value={String(minRating)} onValueChange={(v)=>setFilters({minRating: Number(v)})}>
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

        {/* Reset */}
        <div className="flex items-end">
          <button
            onClick={resetAll}
            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Toggles for side panels (unchanged behavior) */}
      <div className="mt-3 flex flex-wrap items-center gap-6">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showHistoryPanel}
            onChange={e=>setShowHistoryPanel(e.target.checked)}
          />
          <span>Show historical charts</span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showIssuesPanel}
            onChange={e=>setShowIssuesPanel(e.target.checked)}
          />
          <span>Show recurring issues</span>
        </label>
      </div>
    </section>
  );
}

