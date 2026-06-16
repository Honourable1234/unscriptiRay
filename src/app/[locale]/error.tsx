'use client';

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="text-sm text-white-50">{props.error.message}</p>
      <button
        type="button"
        onClick={props.reset}
        className="rounded-lg bg-primary-100 px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
