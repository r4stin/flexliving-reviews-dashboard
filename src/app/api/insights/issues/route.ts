import { NextResponse } from 'next/server';
import { analyzeIssues } from '@/lib/issues-analyzer';
import { getHostawayReviews } from '@/lib/get-hostaway-reviews';
import { summarizeIssuesWithAI } from '@/lib/ai-client';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // pull normalized reviews (mock or live if available)
    const { reviews } = await getHostawayReviews();

    const report = analyzeIssues(
      reviews.map((r) => ({ id: r.id, text: r.text, submittedAt: r.submittedAt }))
    );

    const payloadForAI = {
      timeframe: report.timeframe,
      topCategories: report.topCategories,
      categories: report.categories.map((c) => ({
        category: c.category,
        mentions: c.mentions,
        positive: c.positive,
        negative: c.negative,
      })),
    };

    let aiSummary: string | null = null;
    try {
      aiSummary = await summarizeIssuesWithAI(payloadForAI);
    } catch {
      aiSummary = null; // deterministic stats still render
    }

    return NextResponse.json({ report, aiSummary }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to compute insights';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
