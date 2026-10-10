"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
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
        "Паролата трябва да бъде поне 6 символа."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Двете пароли не съвпадат.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(
        "Линкът може да е изтекъл или да е невалиден. Опитайте отново."
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage(
      "Паролата е променена успешно. Вече можете да влезете във Vendora."
    );
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Нова парола
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Въведете новата си парола.
        </p>

        <form
          onSubmit={handleUpdatePassword}
          className="mt-8 space-y-4"
        >
          <input
            type="password"
            required
            minLength={6}
            placeholder="Нова парола"
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
            placeholder="Повторете новата парола"
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
              ? "Запазване..."
              : "Запази новата парола"}
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
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Вход във Vendora
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}