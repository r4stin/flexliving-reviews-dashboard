import { NextResponse } from 'next/server';
import { getHostawayToken } from '@/lib/hostaway';
import { normalizeReviews } from '@/lib/normalize-reviews';
import mock from '@/data/hostaway-mock.json'; // <- move/copy your mock file here

export async function GET() {
  try {
    // Start with mock as default (covers sandbox/no data)
    let reviews: any[] = Array.isArray((mock as any)?.reviews)
      ? (mock as any).reviews
      : Array.isArray((mock as any)?.data)
      ? (mock as any).data
      : Array.isArray(mock as any)
      ? (mock as any as any[])
      : [];

    // Try live Hostaway API (if creds set and it returns data, prefer it)
    let usedLive = false;
    const token = await getHostawayToken();
    if (token) {
      const res = await fetch('https://api.hostaway.com/v1/reviews', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
        // @ts-ignore next runtime option
        cache: 'no-store',
      });

      if (res.ok) {
        const apiJson = await res.json();
        const list = Array.isArray(apiJson?.result) ? apiJson.result : [];
        if (list.length > 0) {
          reviews = list;
          usedLive = true; // <-- mark that we used live data
        }
      }
    }

    const normalized = normalizeReviews(reviews);
    return NextResponse.json({
      reviews: normalized,
      source: usedLive ? 'hostaway' : 'mock',
    });
  } catch (e: any) {
    // If anything goes wrong, still return mocks so the UI continues working
    const fallbacks: any[] = Array.isArray((mock as any)?.reviews)
      ? (mock as any).reviews
      : Array.isArray((mock as any)?.data)
      ? (mock as any).data
      : Array.isArray(mock as any)
      ? (mock as any as any[])
      : [];
    const normalized = normalizeReviews(fallbacks);
    return NextResponse.json({ reviews: normalized, note: 'fallback: mock' }, { status: 200 });
  }
}
