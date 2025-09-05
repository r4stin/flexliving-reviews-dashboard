'use client';

import type { ReactNode } from 'react';

type Props = {
  className?: string;
  rightActions?: ReactNode; // <- NEW: area for a button/link on the right
};

/**
 * Warm Flex-style top bar with optional right-side actions.
 */
export default function FlexTopBar({ className = '', rightActions }: Props) {
  return (
    <div
      className={`bg-[#FFF9E9] rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Logo (replace with an <img src="/logo.svg" /> if you have one) */}
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Flex" className="h-6 sm:h-7 md:h-8 w-auto" />
        </div>

        {/* Right-side actions (optional) */}
        {rightActions ? (
          <div className="flex items-center gap-2">{rightActions}</div>
        ) : null}
      </div>
    </div>
  );
}
