import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="text-sm text-white-50">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-lg bg-primary-100 px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Go home
      </Link>
    </main>
  );
}
