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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          store_slug: slug,
        },
      },
    });

    if (error) {
      setMessage("Грешка при регистрация: " + error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          store_name: pageName,
          store_slug: slug,
          description: "Добре дошли в нашия магазин.",
          plan: "free",
        },
      ]);

      if (profileError) {
        setMessage("Акаунтът е създаден, но има грешка с магазина.");
        console.error(profileError);
        return;
      }
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Регистрация</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Име" className="w-full border rounded-lg p-3" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Фамилия" className="w-full border rounded-lg p-3" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имейл" className="w-full border rounded-lg p-3" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Парола" className="w-full border rounded-lg p-3" />
          <input value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="Името на вашата страница" className="w-full border rounded-lg p-3" />

          <p className="text-sm text-gray-500">
            Вашият URL ще бъде:<br />
            <strong>localhost:3000/store/{slug || "your-page"}</strong>
          </p>

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Създай профил
          </button>

          {message && <p className="text-center text-sm font-semibold">{message}</p>}
        </form>
      </div>
    </main>
  );
}