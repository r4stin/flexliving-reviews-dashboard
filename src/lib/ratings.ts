import { parseISO, format } from 'date-fns';

export function toDayKey(iso: string) {
  try { return format(parseISO(iso), 'yyyy-MM-dd'); } catch { return iso; }
}

export function average(nums: number[]) {
  const arr = nums.filter(n => typeof n === 'number' && !Number.isNaN(n));
  if (!arr.length) return null;
  return +(arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2);
}
