"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPageEn() {
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
      setMessage("Please fill in all fields.");
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
      setMessage("Registration error: " + error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main
  lang="en"
  className="min-h-screen flex items-center justify-center bg-gray-100"
>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full border rounded-lg p-3"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-full border rounded-lg p-3"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded-lg p-3"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3"
          />

          <input
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Your store name"
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-500">
            Your store URL will be:
            <br />
            <strong>
              {(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}
              /store/{slug || "your-page"}
            </strong>
          </p>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
          >
            Create account
          </button>

          {message && (
            <p className="text-center text-sm font-semibold">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
