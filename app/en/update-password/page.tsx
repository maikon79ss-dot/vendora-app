"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPageEn() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(
        "The link may have expired or is invalid. Please try again."
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage(
      "Your password has been changed successfully. You can now log in to Vendora."
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
          New password
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Enter your new password.
        </p>

        <form
          onSubmit={handleUpdatePassword}
          className="mt-8 space-y-4"
        >
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : "Save new password"}
          </button>

          {message && (
            <p
              className={`text-center text-sm ${
                success
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        {success && (
          <div className="mt-6 text-center">
            <Link
              href="/en/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Login to Vendora
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}