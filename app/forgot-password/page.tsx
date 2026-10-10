"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

    if (error) {
      setMessage(
        "Възникна грешка. Проверете имейла и опитайте отново."
      );
      setLoading(false);
      return;
    }

    setMessage(
      "Изпратихме ви имейл с линк за задаване на нова парола."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Забравена парола
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Въведете имейла, с който сте регистрирани във
          Vendora.
        </p>

        <form
          onSubmit={handleReset}
          className="mt-8 space-y-4"
        >
          <input
            type="email"
            required
            placeholder="Имейл"
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
              ? "Изпращане..."
              : "Изпрати линк за нова парола"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-700">
              {message}
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Обратно към Вход
          </Link>
        </div>
      </div>
    </main>
  );
}