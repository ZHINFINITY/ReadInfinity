import { redirect } from 'next/navigation';

/** Account management is unavailable because the offline build has no accounts. */
export default function UserPage() {
  redirect('/library');
}
