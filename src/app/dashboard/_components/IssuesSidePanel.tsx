'use client';

import { useEffect, useMemo, useState } from 'react';
import { analyzeIssues } from '@/lib/issues-analyzer';
import type { Review } from '../types';
import { Card, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function IssuesSidePanel({ reviews }: { reviews: Review[] }) {
  // deterministic insights from CURRENT filtered reviews
  const report = useMemo(() => {
    return analyzeIssues(
      reviews.map(r => ({ id: r.id, text: r.text, submittedAt: r.submittedAt }))
    );
  }, [reviews]);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // ask server to summarize (optional)
  useEffect(() => {
    const payload = {
      timeframe: report.timeframe,
      topCategories: report.topCategories,
      categories: report.categories.map(c => ({
        category: c.category, mentions: c.mentions, positive: c.positive, negative: c.negative,
      })),
    };
    let cancelled = false;
    setLoadingAI(true);
    fetch('/api/insights/summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(j => { if (!cancelled) setAiSummary(j.aiSummary ?? null); })
      .catch(() => { if (!cancelled) setAiSummary(null); })
      .finally(() => { if (!cancelled) setLoadingAI(false); });
    return () => { cancelled = true; };
  }, [
    report.timeframe.start, report.timeframe.end,
    report.topCategories.join('|'),
    report.categories.map(c=>c.category + c.mentions + c.positive + c.negative).join('|')
  ]);

  const top = useMemo(() =>
    report.categories
      .filter(c => report.topCategories.includes(c.category))
      .sort((a,b)=> b.mentions - a.mentions),
  [report]);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Top recurring themes</CardTitle>
        {top.length === 0 ? (
          <div className="text-sm text-neutral-500">No themes for current filters.</div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top.map(c=>({ name: c.category, negative: c.negative, neutral: c.neutral, positive: c.positive }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false}/>
                <Tooltip />
                <Bar dataKey="negative" stackId="a" />
                <Bar dataKey="neutral" stackId="a" />
                <Bar dataKey="positive" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-2 text-xs text-neutral-500">
          Timeframe: {report.timeframe.start?.slice(0,10) ?? '—'} → {report.timeframe.end?.slice(0,10) ?? '—'}
        </p>
      </Card>

      <Card>
        <CardTitle>Summary</CardTitle>
        {loadingAI ? (
          <div className="text-sm text-neutral-500">Generating…</div>
        ) : aiSummary ? (
          <div className="prose prose-sm dark:prose-invert">
            {aiSummary.split('\n').map((line,i)=> <p key={i}>{line}</p>)}
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            AI summary disabled (no provider configured). Charts reflect current filters.
          </div>
        )}
      </Card>
    </div>
  );
}
