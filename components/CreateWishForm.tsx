"use client";

/**
 * Client form for creating a wish.
 *
 * Uses React 19's useActionState with the createWish Server Action.
 * The theme picker and schedule controls are managed client-side and
 * synced into hidden inputs; the browser converts the chosen local
 * unlock time to a UTC ISO instant (the server cannot know the user's
 * timezone). Validation limits mirror the server for immediate feedback,
 * but the server remains the source of truth.
 */

import { useActionState, useState } from "react";
import {
  LuGift,
  LuMail,
  LuPenLine,
  LuPalette,
  LuAlarmClock,
  LuPartyPopper,
  LuLoaderCircle,
} from "react-icons/lu";
import { createWish } from "@/lib/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes";

const MAX_MESSAGE = 1000;
const MAX_NAME = 60;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-500">{message}</p>;
}

export default function CreateWishForm() {
  const [state, formAction, isPending] = useActionState(
    createWish,
    EMPTY_FORM_STATE
  );

  const [theme, setTheme] = useState<ThemeKey>("pastel");
  const [message, setMessage] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  /**
   * Converts the selected local date/time to a UTC ISO instant.
   * Computed on each render so the hidden input always carries the
   * correct instant; empty when scheduling is disabled or the date
   * is incomplete.
   */
  const scheduledForIso = (() => {
    if (!scheduleEnabled || !scheduledDate) return "";
    const dt = new Date(`${scheduledDate}T${scheduledTime || "00:00"}`);
    return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
  })();

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {/* Honeypot: hidden from users; a filled value marks the submission as automated */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* Controlled theme picker, synced into the form payload */}
      <input type="hidden" name="theme" value={theme} />

      {/* UTC ISO instant of the chosen unlock time ("" when not scheduled) */}
      <input type="hidden" name="scheduled_for" value={scheduledForIso} />

      {/* Non-field error reported by the server action */}
      {state.errors.form ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.errors.form}
        </p>
      ) : null}

      {/* Recipient */}
      <div>
        <label
          htmlFor="recipient_name"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuGift className="h-4 w-4 text-pink-500" />
          Who is this for?
        </label>
        <input
          id="recipient_name"
          name="recipient_name"
          type="text"
          required
          maxLength={MAX_NAME}
          defaultValue={state.values.recipient_name}
          placeholder="e.g. Nimali"
          className={inputClass}
        />
        <FieldError message={state.errors.recipient_name} />
      </div>

      {/* Sender */}
      <div>
        <label
          htmlFor="sender_name"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuMail className="h-4 w-4 text-pink-500" />
          From
        </label>
        <input
          id="sender_name"
          name="sender_name"
          type="text"
          required
          maxLength={MAX_NAME}
          defaultValue={state.values.sender_name}
          placeholder="Your name"
          className={inputClass}
        />
        <FieldError message={state.errors.sender_name} />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"
        >
          <LuPenLine className="h-4 w-4 text-pink-500" />
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write something heartfelt, funny, or both…"
          className={`${inputClass} resize-y`}
        />
        <div className="mt-1 flex items-start justify-between gap-4">
          <FieldError message={state.errors.message} />
          <span
            className={`ml-auto shrink-0 text-xs ${
              message.length > MAX_MESSAGE - 100
                ? "text-orange-500"
                : "text-slate-400"
            }`}
          >
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
      </div>

      {/* Theme picker */}
      <div>
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <LuPalette className="h-4 w-4 text-pink-500" />
          Pick a vibe
        </span>
        <div className="grid grid-cols-2 gap-3">
          {THEME_KEYS.map((key) => {
            const t = THEMES[key];
            const ThemeIcon = t.icon;
            const selected = theme === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setTheme(key)}
                aria-pressed={selected}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  selected
                    ? "border-pink-500 bg-white shadow-lg shadow-pink-200/60"
                    : "border-slate-200 bg-white/60 hover:border-slate-300"
                }`}
              >
                <ThemeIcon
                  className={`h-7 w-7 ${selected ? "text-pink-500" : "text-slate-400"}`}
                />
                <span className="mt-1 block font-semibold text-slate-800">
                  {t.label}
                </span>
                <span className="block text-xs text-slate-400">
                  {t.tagline}
                </span>
                <span
                  className={`mt-2 block h-2 w-full rounded-full ${t.swatchClass}`}
                />
              </button>
            );
          })}
        </div>
        <FieldError message={state.errors.theme} />
      </div>

      {/* Scheduled unlock */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
        <label className="flex items-center gap-3 font-medium text-slate-700">
          <input
            type="checkbox"
            name="scheduled"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
            className="h-4 w-4 accent-pink-500"
          />
          <span className="flex items-center gap-1.5">
            <LuAlarmClock className="h-4 w-4 text-pink-500" />
            Schedule the reveal for later
          </span>
        </label>

        {scheduleEnabled && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                name="scheduled_date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                aria-label="Unlock date"
                className={inputClass}
              />
              <input
                type="time"
                name="scheduled_time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                aria-label="Unlock time"
                className={inputClass}
              />
            </div>
            <p className="text-xs text-slate-400">
              Until then, the link shows a live countdown instead of the wish.
            </p>
            <FieldError message={state.errors.scheduled} />
          </div>
        )}
      </div>

      {/* Submit button with pending state while the action is in flight */}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-4 text-lg font-semibold text-white shadow-xl shadow-pink-300/50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LuLoaderCircle className="h-5 w-5 animate-spin" />
            Wrapping your gift…
          </>
        ) : (
          <>
            <LuPartyPopper className="h-5 w-5" />
            Create wish
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        You&rsquo;ll get a shareable link right after this.
      </p>
    </form>
  );
}