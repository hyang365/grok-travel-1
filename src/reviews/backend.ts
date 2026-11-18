import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The shared database is Supabase (Postgres + email sign-in). Set these two at build time:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY   (see supabase/schema.sql and README)
// The project URL and anon key are public by design (they ship to every browser); row-level
// security in supabase/schema.sql is what protects the data. Env vars override them.
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || "https://lerxldabvyqxixhfzdhc.supabase.co";
export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcnhsZGFidnlxeGl4aGZ6ZGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5ODMyMTEsImV4cCI6MjExMDU1OTIxMX0.0oVxJk96Izdt5M_YbRHQfrUchkX1eStXkiWCfsSgvVw";
const url = SUPABASE_URL;
const key = SUPABASE_ANON_KEY;

// Implicit flow so a sign-in link opened on a phone still works for a laptop request.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { flowType: "implicit" } }) : null;
export const SHARED = supabase !== null;

export const YALE_EMAIL = /^[^@\s]+@yale\.edu$/i;

type IdentityUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: { identity_data?: Record<string, unknown> | null }[] | null;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Yale address from the auth user. Google sometimes puts it only on the identity, not user.email. */
export function yaleEmailOf(user: IdentityUser | null | undefined): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const candidates: unknown[] = [user.email, meta.email];
  for (const identity of user.identities ?? []) {
    const data = identity.identity_data ?? {};
    candidates.push(data.email);
  }
  for (const raw of candidates) {
    const email = asText(raw).toLowerCase();
    if (YALE_EMAIL.test(email)) return email;
  }
  return "";
}

/** Name and picture Google sends with the account. Empty when the provider omitted them. */
export function googleProfileOf(user: IdentityUser | null | undefined): { full_name: string; avatar_url: string | null } {
  const meta = user?.user_metadata ?? {};
  const fromIdentity = user?.identities?.find((identity) => identity.identity_data)?.identity_data ?? {};
  const full_name = (asText(meta.full_name) || asText(meta.name) || asText(fromIdentity.full_name) || asText(fromIdentity.name)).slice(0, 80);
  const avatar = asText(meta.avatar_url) || asText(meta.picture) || asText(fromIdentity.avatar_url) || asText(fromIdentity.picture);
  const avatar_url = avatar.startsWith("https://") && avatar.length <= 500 ? avatar : null;
  return { full_name, avatar_url };
}
