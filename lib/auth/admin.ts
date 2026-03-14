// Authentication utilities for admin section
import { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { AdminUser, AdminRole } from "@/types/admin";

let inFlightAdminLookup: Promise<AdminUser | null> | null = null;

async function fetchAdminByUserId(userId: string): Promise<AdminUser | null> {
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role, is_active, created_at, last_login")
    .eq("id", userId)
    .single();

  if (error || !admin) {
    console.error("Admin user not found in admin_users table:", error);
    return null;
  }

  if (
    !admin.is_active ||
    !["admin", "owner", "dispatcher"].includes(admin.role)
  ) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name || "",
    role: admin.role as AdminRole,
    is_active: admin.is_active,
    created_at: admin.created_at,
    last_login: admin.last_login,
  };
}

/**
 * Get the current authenticated admin user
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  if (inFlightAdminLookup) {
    return inFlightAdminLookup;
  }

  inFlightAdminLookup = (async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return await fetchAdminByUserId(user.id);
    } catch (error) {
      console.error("Error fetching admin user:", error);
      return null;
    } finally {
      inFlightAdminLookup = null;
    }
  })();

  try {
    return await inFlightAdminLookup;
  } catch {
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export function checkPermission(
  userRole: AdminRole | string,
  requiredRole?: AdminRole[],
): boolean {
  if (!requiredRole || requiredRole.length === 0) {
    return true; // No role requirement
  }

  return requiredRole.includes(userRole as AdminRole);
}

/**
 * Admin login
 */
export async function adminLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return {
        success: false,
        error: "Email and password are required.",
      };
    }

    console.log("[adminLogin] Attempting login for:", normalizedEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("[adminLogin] Supabase auth error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      return { success: false, error: error.message };
    }

    const signedInUser = data.user;
    if (!signedInUser) {
      return {
        success: false,
        error: "Login failed. Please try again.",
      };
    }

    const adminUser = await fetchAdminByUserId(signedInUser.id);

    if (!adminUser) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        success: false,
        error:
          "Authenticated, but this account is not authorized for admin access. Add this user to admin_users.",
      };
    }

    console.log("[adminLogin] Login successful for:", normalizedEmail);
    return { success: true };
  } catch (error) {
    console.error("[adminLogin] Unexpected error:", error);
    return {
      success: false,
      error: "Login failed. Please try again.",
    };
  }
}

/**
 * Admin logout
 */
export async function adminLogout(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Logout failed. Please try again.",
    };
  }
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (user: AdminUser | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
    if (event === "SIGNED_OUT") {
      callback(null);
      return;
    }

    const adminUser = await getCurrentAdminUser();
    callback(adminUser);
  });

  return subscription;
}

/**
 * Permissions matrix
 */
export const PERMISSIONS: Record<
  AdminRole,
  {
    canViewDashboard: boolean;
    canManageBookings: boolean;
    canManageInventory: boolean;
    canManagePricing: boolean;
    canManageZones: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  }
> = {
  owner: {
    canViewDashboard: true,
    canManageBookings: true,
    canManageInventory: true,
    canManagePricing: true,
    canManageZones: true,
    canManageUsers: true,
    canViewAnalytics: true,
  },
  admin: {
    canViewDashboard: true,
    canManageBookings: true,
    canManageInventory: true,
    canManagePricing: true,
    canManageZones: true,
    canManageUsers: false,
    canViewAnalytics: true,
  },
  dispatcher: {
    canViewDashboard: true,
    canManageBookings: true,
    canManageInventory: false,
    canManagePricing: false,
    canManageZones: false,
    canManageUsers: false,
    canViewAnalytics: false,
  },
};

/**
 * Check if user can perform action
 */
export function canUserPerformAction(
  role: AdminRole,
  action: keyof typeof PERMISSIONS.owner,
): boolean {
  return PERMISSIONS[role]?.[action] ?? false;
}
