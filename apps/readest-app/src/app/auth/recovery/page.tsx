import { redirect } from 'next/navigation';

/** Password recovery is unavailable because the offline build has no accounts. */
export default function AuthRecoveryPage() {
  redirect('/library');
}
