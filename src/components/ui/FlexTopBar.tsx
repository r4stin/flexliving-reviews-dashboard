'use client';

type Props = {
  className?: string;
};

/**
 * Simple top bar matching the warm Flex style:
 * - Warm background #FFF9E9
 * - Generous padding, rounded corners, shadow
 * - Left-aligned logo (inline SVG so you don’t need an asset)
 */
export default function FlexTopBar({ className = '' }: Props) {
  return (
    <div
      className={`bg-[#FFF9E9] rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Flex" className="h-6 sm:h-7 md:h-8 w-auto" />

        {/* Optional divider dot / tagline (remove if you want logo only) */}
        {/* <span className="text-xs sm:text-sm md:text-base text-[#284E4C]/70">Reviews</span> */}
      </div>
    </div>
  );
}
