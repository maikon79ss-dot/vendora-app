"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPageEn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();

    if (!name || !email || !subject || !message) {
      setNotice("Please fill in all fields.");
      return;
    }

    setNotice("Sending...");

    try {
      const response = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "hello_vendora.trade@abv.bg",
          subject: `Vendora Contact: ${subject}`,
          message: `Name: ${name}

Email: ${email}

Message:
${message}`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setNotice(result.error || "The email was not sent.");
        return;
      }

      setNotice("✅ Your message was sent successfully.");

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Contact form error:", error);
      setNotice("The email was not sent.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/en" className="text-3xl font-extrabold">
            VENDORA
          </Link>

          <Link
            href="/en"
            className="rounded-lg border border-white/30 px-5 py-2 font-semibold hover:bg-white hover:text-slate-950"
          >
            ← Home
          </Link>
        </div>

        <section className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl sm:p-10">
          <h1 className="text-4xl font-extrabold">Contact</h1>

          <p className="mt-3 text-gray-600">
            Have a question about Vendora? Send us a message.
          </p>

          <a
            href="mailto:hello_vendora.trade@abv.bg"
            className="mt-5 inline-block text-lg font-bold text-blue-600 hover:underline"
          >
            ✉ hello_vendora.trade@abv.bg
          </a>

          <form onSubmit={sendMessage} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">Name</label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border p-3"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Email</label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-xl border p-3"
                placeholder="Your email"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Subject</label>

              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border p-3"
                placeholder="What is your message about?"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Message</label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={6}
                className="w-full resize-none rounded-xl border p-3"
                placeholder="Write your message..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700"
            >
              Send
            </button>

            {notice && (
              <p className="text-center font-semibold">{notice}</p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
