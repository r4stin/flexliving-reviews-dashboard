let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Exchanges ACCOUNT_ID (client_id) + API_KEY (client_secret) for an access token.
 * Caches token in memory until ~1 minute before expiry.
 */
export async function getHostawayToken(): Promise<string | null> {
  const id = process.env.HOSTAWAY_ACCOUNT_ID;
  const key = process.env.HOSTAWAY_API_KEY;
  if (!id || !key) return null;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: String(id),
    client_secret: String(key),
    scope: 'general',
  });

  const res = await fetch('https://api.hostaway.com/v1/accessTokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    // @ts-ignore next runtime option
    cache: 'no-store',
    body,
  });

  if (!res.ok) {
    // Don’t throw; caller can fall back to mock
    try { console.warn('Hostaway token error:', await res.text()); } catch {}
    return null;
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  const expiresAt = now + (json.expires_in ?? 3600) * 1000; // default 1h if not provided
  cachedToken = { token: json.access_token, expiresAt };
  return cachedToken.token;
}
