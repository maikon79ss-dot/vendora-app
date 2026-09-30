"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pageName, setPageName] = useState("");
  const [message, setMessage] = useState("");

  const slug = pageName.toLowerCase().trim().replace(/\s+/g, "-");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !pageName) {
      setMessage("Моля, попълнете всички полета.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
       data: {
  first_name: firstName,
  last_name: lastName,
  store_name: pageName,
  store_slug: slug,
},
      },
    });

    if (error) {
      setMessage("Грешка при регистрация: " + error.message);
      return;
    }

    router.push("/dashboard");
  }
return (
  <main className="min-h-screen bg-gray-100 px-4 py-10">
    <div className="mx-auto grid min-h-[700px] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">

      {/* Лява страна – Регистрация */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">

          <h1 className="mb-8 text-center text-3xl font-bold">
            Регистрация
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Име"
              className="w-full rounded-lg border p-3"
            />

            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              className="w-full rounded-lg border p-3"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Имейл"
              className="w-full rounded-lg border p-3"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Парола"
              className="w-full rounded-lg border p-3"
            />

            <input
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Името на вашата страница"
              className="w-full rounded-lg border p-3"
            />

            <p className="text-sm text-gray-500">
              Вашият URL ще бъде:
              <br />
              <strong>
                {(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}
                /store/{slug || "your-page"}
              </strong>
            </p>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
            >
              Създай профил
            </button>

            {message && (
              <p className="text-center text-sm font-semibold">
                {message}
              </p>
            )}

          </form>

        </div>
      </div>

      {/* Дясна страна – изображение */}
      <div className="flex flex-col items-center justify-center bg-blue-50 p-6 md:p-10">

        <img
          src="/Vendora-register.png"
          alt="Създаване на онлайн магазин във Vendora"
          className="max-h-[420px] w-full rounded-2xl object-contain"
        />

        <p className="mt-6 text-center text-xl font-bold text-gray-800">
          ДОБРЕ ДОШЛИ В VENDORA
        </p>

      </div>

    </div>
  </main>
);
}
 
