import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PreambleHomes. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-700">
              How It Works
            </Link>
            <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700">
              Browse
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          This is a pre-market intent platform and does not constitute a property listing service.
          No listing agreement exists between any parties through this platform.
        </p>
      </div>
    </footer>
  );
}
