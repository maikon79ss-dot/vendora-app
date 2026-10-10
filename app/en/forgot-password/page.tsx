"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPageEn() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/en/update-password`,
      });

    if (error) {
      setMessage(
        "Something went wrong. Please check your email and try again."
      );
      setLoading(false);
      return;
    }

    setMessage(
      "We sent you an email with a link to set a new password."
    );

    setLoading(false);
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 px-4 py-10"
    >
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Forgot password
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Enter the email address you use for Vendora.
        </p>

        <form
          onSubmit={handleReset}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Sending..."
              : "Send password reset link"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-700">
              {message}
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/en/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}