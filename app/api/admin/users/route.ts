import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminRole } from "@/types/admin";

type RequestingAdmin = {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
};

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
};

type AuthListUser = {
  id: string;
  email?: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata?: Record<string, unknown>;
};

async function getRequestingAdmin(): Promise<RequestingAdmin | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Not needed for read-only auth checks in this route.
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", user.id)
    .single();

  if (adminError || !adminUser || !adminUser.is_active) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role as AdminRole,
    is_active: adminUser.is_active,
  };
}

export async function GET() {
  try {
    const requestingAdmin = await getRequestingAdmin();

    if (!requestingAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: adminRows, error: adminRowsError }, usersResult] =
      await Promise.all([
        supabaseAdmin
          .from("admin_users")
          .select(
            "id, email, full_name, role, is_active, created_at, last_login",
          ),
        supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        }),
      ]);

    if (adminRowsError) {
      throw adminRowsError;
    }

    if (usersResult.error) {
      throw usersResult.error;
    }

    const adminMap = new Map(
      ((adminRows || []) as AdminUserRow[]).map((row) => [row.id, row]),
    );

    const users = ((usersResult.data?.users || []) as AuthListUser[])
      .map((user) => {
        const adminRecord = adminMap.get(user.id);
        const currentRole = adminRecord?.role ?? null;
        const isActiveAdmin = Boolean(adminRecord?.is_active);
        const canPromote =
          !adminRecord ||
          !adminRecord.is_active ||
          (adminRecord.role !== "admin" && adminRecord.role !== "owner");

        return {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          full_name:
            adminRecord?.full_name ||
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : ""),
          role: currentRole,
          is_active_admin: isActiveAdmin,
          can_promote: canPromote,
        };
      })
      .sort((a, b) => {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return bDate - aDate;
      });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const requestingAdmin = await getRequestingAdmin();

    if (!requestingAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = typeof body?.userId === "string" ? body.userId : "";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const { data: authUserResult, error: authUserError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUserResult?.user) {
      return NextResponse.json(
        { error: "User not found in authentication records" },
        { status: 404 },
      );
    }

    const authUser = authUserResult.user;

    const { data: existingAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    const targetRole: AdminRole =
      existingAdmin?.role === "owner" ? "owner" : "admin";

    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from("admin_users")
      .upsert(
        {
          id: userId,
          email: authUser.email || "",
          full_name:
            existingAdmin?.role === "owner"
              ? undefined
              : typeof authUser.user_metadata?.full_name === "string"
                ? authUser.user_metadata.full_name
                : null,
          role: targetRole,
          is_active: true,
        },
        { onConflict: "id" },
      )
      .select("id, email, full_name, role, is_active")
      .single();

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({
      success: true,
      user: upserted,
      message:
        targetRole === "owner"
          ? "Owner role preserved"
          : "User promoted to admin",
    });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}
