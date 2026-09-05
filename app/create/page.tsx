/**
 * Create page: hosts the wish creation form.
 * Static shell; all interactivity lives in CreateWishForm.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LuCake, LuArrowLeft } from "react-icons/lu";
import CreateWishForm from "@/components/CreateWishForm";

export const metadata: Metadata = {
  title: "Create a wish",
  description:
    "Write a birthday wish, pick a theme, and share it with a single link.",
};

export default function CreatePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-gradient-to-br from-slate-50 via-rose-50 to-sky-50 px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
        >
          <LuArrowLeft className="h-4 w-4" /> Home
        </Link>

        <h1 className="mt-4 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
          <LuCake className="h-8 w-8 text-pink-500" />
          Create a birthday wish
        </h1>
        <p className="mt-2 text-slate-500">
          Fill this in, grab the link, send it to the birthday star.
        </p>

        <CreateWishForm />
      </div>
    </main>
  );
}