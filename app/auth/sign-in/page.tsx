import { redirect } from 'next/navigation';

export default async function AuthSignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : '/account';
  redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}
