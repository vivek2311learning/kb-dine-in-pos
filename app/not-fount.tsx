import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>

      <p className="text-gray-500">Page not found</p>

      <Link href="/" className="bg-black text-white px-4 py-2 rounded-lg">
        Go Home
      </Link>
    </div>
  );
}
