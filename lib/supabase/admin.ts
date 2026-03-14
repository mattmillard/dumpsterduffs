import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const hasSupabaseAdminEnv = Boolean(supabaseUrl && serviceRoleKey);

const supabaseAdminClient = hasSupabaseAdminEnv
  ? createClient(supabaseUrl as string, serviceRoleKey as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

function missingAdminEnvError() {
  return new Error(
    "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
}

export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    throw missingAdminEnvError();
  }

  return supabaseAdminClient;
}

export const supabaseAdmin: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as unknown as Record<string, unknown>)[String(prop)];

    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
});
