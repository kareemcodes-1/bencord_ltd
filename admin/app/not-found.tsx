import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-background px-5 pt-20 text-center text-foreground transition-colors duration-300 sm:px-6 sm:pt-[5rem]">
      <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#ee0a0a]">
        Error 404
      </p>

      <h1 className="heading-1 mb-4">
        Page not found
      </h1>

      <p className="mx-auto mb-8 max-w-[22rem] text-[0.95rem] leading-relaxed text-muted-foreground sm:mb-10 sm:max-w-[28rem]">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Check the URL, or head back home.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home size={16} strokeWidth={1.8} />
          Back to home
        </Link>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
        >
          <Search size={16} strokeWidth={1.8} />
          Browse shop
        </Link>
      </div>
    </main>
  );
}
