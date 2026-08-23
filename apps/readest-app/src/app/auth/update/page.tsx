import { redirect } from 'next/navigation';

/** Account updates are unavailable because the offline build has no accounts. */
export default function AuthUpdatePage() {
  redirect('/library');
}
