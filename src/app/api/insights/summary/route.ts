import { NextResponse } from 'next/server';
import { summarizeIssuesWithAI } from '@/lib/ai-client';

// We expect an aggregated payload (NOT raw reviews)
type CategoryAgg = { category: string; mentions: number; positive: number; negative: number };
type Body = {
  timeframe: { start: string | null; end: string | null };
  topCategories: string[];
  categories: CategoryAgg[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    // If no provider configured, summarizeIssuesWithAI returns null (graceful)
    const summary = await summarizeIssuesWithAI(body);
    return NextResponse.json({ aiSummary: summary }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to summarize';
    return NextResponse.json({ aiSummary: null, error: msg }, { status: 200 });
  }
}
