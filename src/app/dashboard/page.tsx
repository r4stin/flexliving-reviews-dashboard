'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useHostaway from './_hooks/useHostaway';
import useApprovals from './_hooks/useApprovals';
import Metrics from './_components/Metrics';
import FiltersBar from './_components/Filters';
import ReviewsTable from './_components/ReviewsTable';
import { filterReviews, sortReviews, timeseriesAverage, channelDistribution, computedRating, allCategories } from './_logic/compute';
import type { Filters, SortKey } from './types';
import IssuesSidePanel from './_components/IssuesSidePanel';
import ChartsSidePanel from './_components/ChartsSidePanel';


export default function DashboardPage() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useHostaway();
  const { data: approvals } = useApprovals();

  // ---- state
  const [filters, setFiltersState] = useState<Filters>({
    property: 'all', channel: 'all', status: 'all',
    dateFrom: '', dateTo: '', minRating: 0, category: 'all'
  });
  const setFilters = (patch: Partial<Filters>) => setFiltersState(prev => ({ ...prev, ...patch }));

  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showIssuesPanel, setShowIssuesPanel] = useState(false);


  type Dir = 'asc' | 'desc';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<Dir>('desc');
  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ---- options
  const allProperties = useMemo(() => {
    const s = new Set<string>();
    reviews.forEach(r => { if (r.listingName) s.add(r.listingName); });
    return ['all', ...Array.from(s).sort()];
  }, [reviews]);

  const allChannels = useMemo(() => {
    const s = new Set<string>();
    reviews.forEach(r => { if (r.channel) s.add(r.channel); });
    return ['all', ...Array.from(s).sort()];
  }, [reviews]);

  const categories = useMemo(() => allCategories(reviews), [reviews]);


  // ---- filtered & sorted
  const filtered = useMemo(() => filterReviews(reviews, filters, approvals), [reviews, filters, approvals]);
  const sorted = useMemo(() => sortReviews(filtered, sortKey, sortDir, approvals), [filtered, sortKey, sortDir, approvals]);

  // ---- metrics
  const total = sorted.length;
  const avgRating = useMemo(() => {
    const vals = sorted.map(computedRating).filter((n): n is number => n != null);
    if (!vals.length) return null;
    return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  }, [sorted]);

  const approvalRate = useMemo(() => {
    if (!approvals || total === 0) return null;
    let count = 0;
    sorted.forEach(r => { if (approvals.get(r.id)) count++; });
    return Math.round((count / total) * 100);
  }, [approvals, sorted, total]);

  const topChannel = useMemo(() => {
    const dist = channelDistribution(sorted);
    if (!dist.length) return null;
    const top = [...dist].sort((a, b) => b.count - a.count)[0];
    return { channel: top.name, count: top.count };
  }, [sorted]);

  // ---- charts data
  const ts = useMemo(() => timeseriesAverage(sorted), [sorted]);
  const cd = useMemo(() => channelDistribution(sorted), [sorted]);

  // ---- actions (mutations)
  const approve = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved: true }),
      });
      if (!res.ok) throw new Error('Approve failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const deny = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approved: false }),
      });
      if (!res.ok) throw new Error('Deny failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });

  const pending = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/approve?reviewId=${encodeURIComponent(reviewId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Pending failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews Dashboard</h1>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">The Flex · Manager view</div>
      </header>

      <Metrics
        avgRating={avgRating}
        total={total}
        approvalRate={approvalRate}
        topChannel={topChannel}
      />

      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        allProperties={allProperties}
        allChannels={allChannels}
        allCategories={categories}
        showIssuesPanel={showIssuesPanel}
        setShowIssuesPanel={setShowIssuesPanel}
        showHistoryPanel={showHistoryPanel}
        setShowHistoryPanel={setShowHistoryPanel}
      />

      {/* --- Side rails positioned OUTSIDE the centered container --- */}
      {/* We do NOT add padding to the wrapper, so the center width never changes */}

      {/* LEFT: Historical charts rail */}
      {showHistoryPanel && (
        <aside
          className="hidden 2xl:flex fixed top-50 h-[calc(100vh-6rem)] w-[300px] overflow-auto z-20
                    border-r border-neutral-200 dark:border-neutral-800
                    bg-white dark:bg-neutral-900
                    rounded-2xl shadow-lg"   // ⬅ added rounding + shadow
          style={{
            left: 'calc(50vw - 36rem - 300px)',
          }}
        >
          <div className="w-full p-4">
            <ChartsSidePanel timeseries={ts} channelDist={cd} />
          </div>
        </aside>
      )}

      {/* RIGHT: Recurring issues rail */}
      {showIssuesPanel && (
        <aside
          className="hidden 2xl:flex fixed top-50 h-[calc(100vh-6rem)] w-[340px] overflow-auto z-20
                    border-l border-neutral-200 dark:border-neutral-800
                    bg-white dark:bg-neutral-900
                    rounded-2xl shadow-lg"   // ⬅ same here
          style={{
            left: 'calc(50vw + 36rem)',
          }}
        >
          <div className="w-full p-4">
            <IssuesSidePanel reviews={sorted} />
          </div>
        </aside>
      )}


      {/* CENTER stays exactly the same width as before */}
      <div className="mx-auto max-w-6xl space-y-6">
        <ReviewsTable
          reviews={isLoading ? [] : sorted}
          approvals={approvals}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          onApprove={(id) => approve.mutate(id)}
          onDeny={(id) => deny.mutate(id)}
          onPending={(id) => pending.mutate(id)}
        />
      </div>


    </div>
  );
}
