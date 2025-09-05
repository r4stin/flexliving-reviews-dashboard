export type IssueCategory =
  | 'cleanliness' | 'noise' | 'communication' | 'amenities' | 'location'
  | 'checkin' | 'wifi' | 'comfort' | 'value';

export const ISSUE_TAXONOMY: Record<IssueCategory, string[]> = {
  cleanliness: ['clean', 'spotless', 'dirty', 'dust', 'stain', 'smell'],
  noise: ['noisy', 'noise', 'loud', 'quiet', 'street', 'construction'],
  communication: ['host', 'responsive', 'communication', 'reply', 'helpful'],
  amenities: ['amenities', 'kitchen', 'shower', 'bed', 'heating', 'ac', 'air conditioning'],
  location: ['location', 'neighborhood', 'area', 'close to', 'distance', 'walk'],
  checkin: ['check-in', 'check in', 'check-out', 'check out', 'late', 'early', 'keys', 'lockbox'],
  wifi: ['wifi', 'wi-fi', 'internet', 'connection', 'speed'],
  comfort: ['comfortable', 'comfort', 'bed', 'mattress', 'pillow', 'cozy'],
  value: ['price', 'expensive', 'cheap', 'value', 'worth'],
};
