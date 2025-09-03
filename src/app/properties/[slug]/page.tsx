// // src/app/properties/[slug]/page.tsx
// import { headers } from 'next/headers';

// type Review = {
//   id: string;
//   reviewerName: string;
//   submittedAt: string;
//   text: string;
//   listingName?: string;
// };

// function slugify(name: string) {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')  // non-alphanumerics -> dashes
//     .replace(/(^-|-$)+/g, '');    // trim dashes
// }

// async function getApproved(): Promise<Review[]> {
//   const h = headers();
//   const host = h.get('x-forwarded-host') ?? h.get('host')!;
//   const proto = h.get('x-forwarded-proto') ?? 'http';
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`;

//   const res = await fetch(`${baseUrl}/api/reviews/approved`, { cache: 'no-store' });
//   if (!res.ok) throw new Error('Failed to fetch approved reviews');
//   const json = await res.json();
//   return (json.reviews ?? []) as Review[];
// }

// export default async function PropertyPage({ params }: { params: { slug: string } }) {
//   const approved = await getApproved();

//   // (Optional) If you want to show reviews per property slug, filter here:
//   const filtered = approved.filter(r =>
//     r.listingName ? slugify(r.listingName) === params.slug : true
//   );

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Property: {params.slug}</h1>
//       {filtered.length === 0 ? (
//         <div className="opacity-70">No approved reviews yet.</div>
//       ) : (
//         <ul className="space-y-4">
//           {filtered.map((r) => (
//             <li key={r.id} className="border rounded p-4">
//               <div className="flex justify-between">
//                 <div className="font-medium">{r.reviewerName}</div>
//                 <div className="text-sm opacity-70">
//                   {new Date(r.submittedAt).toLocaleDateString()}
//                 </div>
//               </div>
//               <p className="mt-2">{r.text}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
import { getBaseUrl } from '@/lib/get-base-url';

type Review = {
  id: string;
  reviewerName: string;
  submittedAt: string;
  text: string;
  listingName?: string;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function getApproved(): Promise<Review[]> {
  const baseUrl = await getBaseUrl(); // ⬅️ now async
  const res = await fetch(`${baseUrl}/api/reviews/approved`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch approved reviews');
  const json = await res.json();
  return (json.reviews ?? []) as Review[];
}

// ⬅️ params is now a Promise in Next 15 with React 19
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ⬅️ await the params object

  const approved = await getApproved();
  const filtered = approved.filter(
    (r) => (r.listingName ? slugify(r.listingName) : '') === slug
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Property: {slug}</h1>
      {filtered.length === 0 ? (
        <div className="opacity-70">No approved reviews yet.</div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((r) => (
            <li key={r.id} className="border rounded p-4">
              <div className="flex justify-between">
                <div className="font-medium">{r.reviewerName}</div>
                <div className="text-sm opacity-70">
                  {new Date(r.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <p className="mt-2">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
