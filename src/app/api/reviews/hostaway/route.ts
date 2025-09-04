import { NextResponse } from 'next/server';
import { getHostawayReviews } from '@/lib/get-hostaway-reviews';

export async function GET() {
  const { reviews, source } = await getHostawayReviews();
  return NextResponse.json({ reviews, source });
}
