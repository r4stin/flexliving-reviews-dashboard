import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import FlexBar from '@/components/site/FlexBar';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flex Reviews',
  description: 'Guest reviews dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
      //   className={`${geistSans.variable} ${geistMono.variable} antialiased
      //         bg-gray-50 text-neutral-900
      //         dark:bg-neutral-950 dark:text-neutral-100`}
      // >
        className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-[88px]">
          <Providers>
            <FlexBar />
            {children}
            </Providers>
      </body>
    </html>
  );
}
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       {/* Push body content below the fixed 88px header */}
//       <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-[88px]">
//         <FlexBar />
//         {children}
//       </body>
//     </html>
//   );
// }

