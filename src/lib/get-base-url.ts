import { headers } from 'next/headers';

/** Returns an absolute base URL for server-side fetches (local + Vercel). */
export async function getBaseUrl() {
  const h = await headers(); 
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;
}
