/**
 * Shared form state for the create-wish Server Action.
 *
 * Lives in its own module (without "use server") because Next.js
 * restricts "use server" files to exporting async functions only.
 * The client form imports the type and initial state from here, keeping
 * both sides of the action contract in sync.
 */
export type CreateWishState = {
  ok: boolean;
  /** Map of field name to validation message, rendered inline per field */
  errors: Record<string, string>;
  /** Previously submitted values, used to re-populate the form after a failed submit */
  values: {
    recipient_name: string;
    sender_name: string;
    message: string;
    theme: string;
    scheduled: boolean;
    scheduled_date: string;
    scheduled_time: string;
    music_track: string;
  };
};

export const EMPTY_FORM_STATE: CreateWishState = {
  ok: false,
  errors: {},
  values: {
    recipient_name: "",
    sender_name: "",
    message: "",
    theme: "pastel",
    scheduled: false,
    scheduled_date: "",
    scheduled_time: "",
    music_track: "",
  },
};
