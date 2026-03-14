// Supabase client setup for browser
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasSupabaseClientEnv = Boolean(supabaseUrl && supabaseAnonKey);

const supabaseClient = hasSupabaseClientEnv
  ? createBrowserClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

function missingClientEnvError() {
  return new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

function getSupabaseClient() {
  if (!supabaseClient) {
    throw missingClientEnvError();
  }

  return supabaseClient;
}

export const supabase: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as unknown as Record<string, unknown>)[String(prop)];

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});

export default supabase;
