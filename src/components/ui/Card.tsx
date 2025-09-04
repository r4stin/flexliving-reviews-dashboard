'use client';
import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      {children}
    </div>
  );
}
export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{children}</h3>;
}
export function CardValue({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-2xl font-bold">{children}</div>;
}
