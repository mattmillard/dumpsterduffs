"use client";

import { Suspense } from "react";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin } from "@/lib/auth/admin";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F]" aria-hidden="true" />
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    async function initializeAuthFlow() {
      if (typeof window === "undefined") {
        setIsInitializing(false);
        return;
      }

      const queryParams = new URLSearchParams(window.location.search);
      const isResetMode = queryParams.get("mode") === "reset";

      // Check for existing session (set by callback page)
      if (isResetMode) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Session already exists from callback, just show reset form
          setMode("reset");
          setMessage("Enter your new password below.");
          setIsInitializing(false);
          return;
        }
      }

      // Fall back to handling tokens from hash (direct links)
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) {
        if (isResetMode) {
          setMode("reset");
          setMessage("Enter your new password below.");
        }
        setIsInitializing(false);
        return;
      }

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (
        (type === "recovery" || type === "invite") &&
        accessToken &&
        refreshToken
      ) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(
            "This password link is invalid or expired. Request a new one.",
          );
        } else {
          setMode("reset");
          setMessage(
            type === "invite"
              ? "Invite confirmed. Set your password to continue."
              : "Enter your new password below.",
          );
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search,
        );
      }

      setIsInitializing(false);
    }

    initializeAuthFlow();
  }, []);

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    const submittedEmail = email.trim().toLowerCase();
    if (!submittedEmail) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        submittedEmail,
        {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        },
      );

      if (resetError) {
        // Handle rate limiting specifically
        if (resetError.message?.includes("429") || resetError.status === 429) {
          setError(
            "Too many password reset requests. Please wait 30 minutes and try again.",
          );
        } else {
          setError(
            resetError.message || "Unable to send password reset email.",
          );
        }
        return;
      }

      setMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      // Check if it's a rate limit error
      if (err?.status === 429 || err?.message?.includes("429")) {
        setError(
          "Too many password reset requests. Please wait 30 minutes and try again.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const submittedEmail = (
      formData.get("email")?.toString().trim() || email.trim()
    ).toLowerCase();
    const submittedPassword = formData.get("password")?.toString() || password;

    if (!submittedEmail || !submittedPassword) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const result = await adminLogin(submittedEmail, submittedPassword);

      if (!result.success) {
        setError(result.error || "Invalid credentials.");
        return;
      }

      // Clear any old demo auth
      localStorage.removeItem("admin_demo_auth");

      const redirectTarget = searchParams.get("redirect");
      const safeRedirect =
        redirectTarget && redirectTarget.startsWith("/admin")
          ? redirectTarget
          : "/admin/dashboard";

      window.location.assign(safeRedirect);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || "Unable to update password.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }

      await supabase.auth.signOut();

      setMode("login");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password set successfully. Please sign in.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <p className="text-[#999999]">Preparing secure login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img
              src="/logo.png"
              alt="Dumpster Duff's"
              className="w-12 h-12 mx-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-[#999999]">
            {mode === "reset"
              ? "Set your admin password"
              : "Secure access to your operations dashboard"}
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8 bg-[#1A1A1A]">
          {mode === "reset" ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full"
                  required
                />
              </div>

              {message && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full font-semibold text-base"
              >
                Set Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dumpsterduffs.com"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full"
                  required
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mt-2 text-sm text-primary hover:text-primary-light"
                >
                  Forgot password?
                </button>
              </div>

              {message && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-400">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full font-semibold text-base"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
