import { headers } from 'next/headers';

/** Works on server (Node/Vercel). Next 15: headers() must be awaited. */
export async function getBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
