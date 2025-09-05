'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Fixed full-width top bar inspired by Flex.
 * - Warm light background at top, switches to deep green when scrolled
 * - Covers the whole width, no rounded corners
 * - Z-index sits above side panels
 *
 * Drop two logos in /public:
 *  - /logo-flex-dark.png  (for light header)
 *  - /logo-flex-white.png (for dark header)
 */
export default function FlexBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 h-[88px] z-[60]',
        'transition-colors duration-300',
        scrolled
          ? 'bg-[#284E4C] text-white shadow-md'
          : 'bg-[#FFF9E9] text-[#333333]',
      ].join(' ')}
    >
      <div className="h-full container mx-auto max-w-6xl px-4">
        <nav className="flex items-center justify-between h-full">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <Image
                src={scrolled ? '/logo-flex-white.png' : '/logo-flex-dark.png'}
                alt="The Flex"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right: Simple links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="./"
              className={[
                'text-sm font-medium',
                scrolled ? 'text-white hover:opacity-90' : 'text-[#333333]',
              ].join(' ')}
            >
              Properties
            </Link>
            <Link
              href="/dashboard"
              className={[
                'text-sm font-medium',
                scrolled ? 'text-white hover:opacity-90' : 'text-[#333333]',
              ].join(' ')}
            >
              Dashboard
            </Link>
            </div>

          {/* Mobile: simple menu icon (non-functional placeholder) */}
          <div className="md:hidden">
            <button
              className={[
                'inline-flex items-center justify-center text-xs h-10 w-10 rounded-full border-2 border-transparent transition',
                scrolled ? 'text-white hover:bg-white/10' : 'text-[#333333] hover:bg-gray-100',
              ].join(' ')}
              aria-label="Menu"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
