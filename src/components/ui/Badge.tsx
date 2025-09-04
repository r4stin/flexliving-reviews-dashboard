'use client';
import clsx from 'clsx';

export default function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-700',
        'bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 text-xs',
        'text-neutral-700 dark:text-neutral-200',
        className
      )}
    >
      {children}
    </span>
  );
}
