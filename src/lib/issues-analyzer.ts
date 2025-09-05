import Sentiment from 'sentiment';
import { ISSUE_TAXONOMY, type IssueCategory } from './issues-taxonomy';

const s = new Sentiment();

export type ReviewLike = {
  id: string;
  text: string;
  submittedAt: string; // ISO
};

export type CategoryStats = {
  category: IssueCategory;
  mentions: number;
  positive: number;
  negative: number;
  neutral: number;
  examples: { id: string; snippet: string }[];
  byMonth: Record<string, number>; // "YYYY-MM" -> count
};

export type IssuesReport = {
  categories: CategoryStats[];
  topCategories: IssueCategory[];
  timeframe: { start: string | null; end: string | null };
};

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function snippet(t: string, n = 160) {
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}

export function analyzeIssues(reviews: ReviewLike[], opts?: { maxExamples?: number }): IssuesReport {
  const maxExamples = opts?.maxExamples ?? 3;

  // init buckets
  const buckets = new Map<IssueCategory, CategoryStats>();
  (Object.keys(ISSUE_TAXONOMY) as IssueCategory[]).forEach((cat) => {
    buckets.set(cat, {
      category: cat,
      mentions: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      examples: [],
      byMonth: {},
    });
  });

  let start: string | null = null;
  let end: string | null = null;

  for (const r of reviews) {
    if (!r.text?.trim()) continue;

    const lower = r.text.toLowerCase();
    const month = monthKey(r.submittedAt);
    const score = s.analyze(r.text).score; // >0 pos, <0 neg, 0 neutral

    if (!start || r.submittedAt < start) start = r.submittedAt;
    if (!end || r.submittedAt > end) end = r.submittedAt;

    for (const [cat, keywords] of Object.entries(ISSUE_TAXONOMY) as [IssueCategory, string[]][]) {
      if (keywords.some((k) => lower.includes(k))) {
        const b = buckets.get(cat)!;
        b.mentions++;
        if (score > 0) b.positive++;
        else if (score < 0) b.negative++;
        else b.neutral++;
        b.byMonth[month] = (b.byMonth[month] ?? 0) + 1;
        if (b.examples.length < maxExamples) b.examples.push({ id: r.id, snippet: snippet(r.text) });
      }
    }
  }

  const categories = Array.from(buckets.values());
  const topCategories = categories
    .slice()
    .sort((a, b) => (b.mentions - a.mentions) || (b.negative - a.negative))
    .slice(0, 5)
    .map((c) => c.category);

  return { categories, topCategories, timeframe: { start, end } };
}
