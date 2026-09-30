"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPageEn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Incorrect email or password.");
      return;
    }

    router.push("/en/dashboard");
  }

 return (
  <main
    lang="en"
    className="min-h-screen bg-gray-100 px-4 py-10"
  >
    <div className="mx-auto grid min-h-[620px] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">

      {/* Left side – Login */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">

          <h1 className="mb-8 text-center text-3xl font-bold">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
            >
              Login
            </button>

            {message && (
              <p className="text-center text-red-600">
                {message}
              </p>
            )}

          </form>

        </div>
      </div>

      {/* Right side – image */}
      <div className="flex flex-col items-center justify-center bg-blue-50 p-6 md:p-10">

        <img
          src="/Vendora-login.png"
          alt="Online shopping with Vendora"
          className="max-h-[420px] w-full rounded-2xl object-contain"
        />

        <p className="mt-6 text-center text-xl font-bold text-gray-800">
          Welcome back to Vendora
        </p>

      </div>

    </div>
  </main>
);
}
