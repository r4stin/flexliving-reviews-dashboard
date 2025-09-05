type PlaceDetailsResult = {
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      time?: number;                // unix seconds
      relative_time_description?: string;
      rating?: number;
      text?: string;
      language?: string;
      author_name?: string;
      author_url?: string;
      profile_photo_url?: string;
    }>;
    url?: string; // google place url
  };
  status?: string;
  error_message?: string;
};

export async function getPlaceDetails(placeId: string, apiKey = process.env.GOOGLE_MAPS_API_KEY): Promise<PlaceDetailsResult> {
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set');
  }

  // Request only what we need to keep response small
  // Note: v3/v1 field syntax differs; this uses legacy v1 style which is still widely used.
  const fields = [
    'name',
    'rating',
    'user_ratings_total',
    'reviews',
    'url'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { cache: 'no-store' as any });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Google Place Details failed: ${txt || res.status}`);
  }
  return res.json();
}
