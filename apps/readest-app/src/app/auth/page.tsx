import { redirect } from 'next/navigation';

/** Authentication is intentionally unavailable in the offline Read∞ build. */
export default function AuthPage() {
  redirect('/library');
}
