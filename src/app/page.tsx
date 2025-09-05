import { redirect } from 'next/navigation';

export default function Home() {
  // Send the root "/" to the public properties page
  redirect('/properties');
}
