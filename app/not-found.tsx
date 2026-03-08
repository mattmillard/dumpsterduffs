"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0F0F0F] px-4 py-16 flex items-center justify-center">
      <div className="max-w-xl w-full card p-8 text-center">
        <p className="text-primary font-semibold tracking-wide uppercase text-sm mb-2">
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-[#999999] mb-8">
          The page you’re looking for doesn’t exist or may have moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.back()} className="btn-secondary">
            Go Back
          </button>
          <Link href="/" className="btn-primary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
