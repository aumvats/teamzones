import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-5">&#127760;</p>
        <h1 className="font-heading font-bold text-2xl mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
