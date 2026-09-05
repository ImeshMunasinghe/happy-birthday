/**
 * Global 404 page, shown for unknown routes and unresolvable wish ids.
 */
import Link from "next/link";
import { LuSearchX, LuArrowRight } from "react-icons/lu";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50 px-6 text-center">
      <LuSearchX className="h-16 w-16 animate-pop-in text-slate-400" />
      <h1 className="mt-6 text-3xl font-extrabold text-slate-800">
        This wish blew away…
      </h1>
      <p className="mt-2 max-w-sm text-slate-500">
        The link may be mistyped, or the wish was never created.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:scale-105"
      >
        Make your own wish <LuArrowRight className="h-4 w-4" />
      </Link>
    </main>
  );
}