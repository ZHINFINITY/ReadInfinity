import { redirect } from 'next/navigation';

/** Authentication is intentionally unavailable in the offline ReadInfinity build. */
export default function AuthPage() {
  redirect('/library');
}
