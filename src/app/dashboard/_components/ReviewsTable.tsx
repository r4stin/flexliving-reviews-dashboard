'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Badge from '@/components/ui/Badge';
import type { Review, SortKey, Status } from '../types';
import { computedRating, getStatus } from '../_logic/compute';

type Props = {
  reviews: Review[];                    // already filtered + sorted
  approvals?: Map<string, boolean>;     // to compute status
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  onApprove: (id: string) => void;      // sets approved=true
  onDeny: (id: string) => void;         // sets approved=false
  onPending: (id: string) => void;      // clears decision
};

export default function ReviewsTable({
  reviews, approvals, sortKey, sortDir, onSort, onApprove, onDeny, onPending,
}: Props) {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      <table className="min-w-full text-sm table-fixed">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            <Th
              label="Listing"
              k="listing"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className="text-left"
            />
            <th className="px-4 py-3 text-center">Guest</th>
            <Th label="Rating" k="rating" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="text-center" />
            <th className="px-4 py-3 text-center">Review</th>
            <th
              className="px-4 py-3 w-[140px] cursor-pointer select-none text-center"
              onClick={() => onSort('status')}
              title="Sort"
            >
              <span className="inline-flex items-center gap-1">
                Status
                <span className="text-xs text-neutral-500">
                  {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </span>
              </span>
            </th>
            <Th label="Channel" k="channel" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="text-center" />
            <Th label="Date" k="date" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="text-center" />
            <th className="px-4 py-3 w-[180px] text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <tr><td className="px-4 py-6" colSpan={8}>No reviews match your filters.</td></tr>
          ) : reviews.map(r => {
            const rating = computedRating(r);
            const st: Status = getStatus(r.id, approvals);

            const baseBtn =
              'rounded-full px-3 py-1 text-sm transition focus:outline-none focus:ring-2 ' +
              'disabled:opacity-60 disabled:cursor-not-allowed';

            const outlineGreen =
              'border border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500 ' +
              'hover:bg-emerald-600/10';
            const filledGreen = 'bg-emerald-600 text-white focus:ring-emerald-400';

            const outlineRed =
              'border border-rose-600 text-rose-700 dark:text-rose-400 dark:border-rose-500 ' +
              'hover:bg-rose-600/10';
            const filledRed = 'bg-rose-600 text-white focus:ring-rose-400';

            const approveActive = st === 'approved';
            const denyActive = st === 'denied';

            return (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-4 py-3 text-left">{r.listingName ?? '—'}</td>
                <td className="px-4 py-3 text-center">{r.reviewerName}</td>
                <td className="px-4 py-3 text-center">{rating ?? '—'}</td>
                <td className="px-4 py-3 max-w-[420px] text-center">
                  <div className="line-clamp-2">{r.text}</div>
                  {Boolean(r.text) && (
                    <ReviewDialog review={r} />
                  )}
                </td>
                <td className="px-4 py-3 w-[140px] text-center">
                  <div className="w-24">
                    {st === 'approved' && <Badge className="w-24 justify-center">Approved</Badge>}
                    {st === 'denied'   && <Badge className="w-24 justify-center">Denied</Badge>}
                    {st === 'pending'  && <Badge className="w-24 justify-center">Pending</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{r.channel ?? 'other'}</td>
                <td className="px-4 py-3 text-center">{new Date(r.submittedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 w-[180px] text-center">
                  <div className="flex gap-2 flex-nowrap justify-start">
                    {/* Approve toggle */}
                    <button
                      type="button"
                      aria-pressed={approveActive}
                      onClick={() => (approveActive ? onPending(r.id) : onApprove(r.id))}
                      className={`${baseBtn} ${approveActive ? filledGreen : outlineGreen} w-24 justify-center whitespace-nowrap`}
                      title={approveActive ? 'Set to Pending' : 'Mark as Approved'}
                    >
                      {approveActive ? 'Approved' : 'Approve'}
                    </button>

                    {/* Deny toggle */}
                    <button
                      type="button"
                      aria-pressed={denyActive}
                      onClick={() => (denyActive ? onPending(r.id) : onDeny(r.id))}
                      className={`${baseBtn} ${denyActive ? filledRed : outlineRed} w-24 justify-center whitespace-nowrap`}
                      title={denyActive ? 'Set to Pending' : 'Mark as Denied'}
                    >
                      {denyActive ? 'Denied' : 'Deny'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function Th({
  label, k, sortKey, sortDir, onSort, className = '',
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <th
      className={`px-4 py-3 cursor-pointer select-none ${className}`}
      onClick={() => onSort(k)}
      title="Sort"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-xs text-neutral-500">
          {active ? (sortDir === 'asc' ? '▲' : '▼') : ''}
        </span>
      </span>
    </th>
  );
}

function ReviewDialog({ review }: { review: Review }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="mt-1 text-xs underline text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
          title="Read full review"
        >
          Read
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* overlay */}
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        {/* content */}
        <Dialog.Content
          className="fixed z-[1001] left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2
                     rounded-2xl border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 p-5 shadow-xl
                     data-[state=open]:animate-in data-[state=closed]:animate-out"
        >
          <Dialog.Title className="text-base font-semibold">
            Full review
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-neutral-500">
            {review.listingName ?? 'Property'} • {review.channel ?? 'other'} •{' '}
            {new Date(review.submittedAt).toLocaleDateString()}
          </Dialog.Description>

          <div className="mt-4 space-y-3">
            <div className="text-sm leading-7 whitespace-pre-wrap">
              {review.text}
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-500">Guest:</span>
              <span className="text-xs font-medium">{review.reviewerName}</span>
              {review.ratingOverall != null && (
                <>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs">Overall: {review.ratingOverall}</span>
                </>
              )}
              {review.ratingsByCategory?.length > 0 && (
                <div className="w-full flex flex-wrap gap-2 pt-2">
                  {review.ratingsByCategory.map(c => (
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
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Dialog.Close asChild>
              <button
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                aria-label="Close"
              >
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
