"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ConfirmationStatus =
  | "loading"
  | "success"
  | "error";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] =
    useState<ConfirmationStatus>("loading");

  const [message, setMessage] = useState(
    "Потвърждаваме абонамента..."
  );

  const [confirmedPlan, setConfirmedPlan] =
    useState<string | null>(null);

  useEffect(() => {
    async function confirmSubscription() {
      if (!sessionId) {
        setStatus("error");
        setMessage(
          "Липсва Stripe Session ID."
        );
        return;
      }

      try {
        const response = await fetch(
          "/api/stripe/confirm-subscription",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error(
            "Confirm subscription error:",
            result
          );

          setStatus("error");
          setMessage(
            result.error ||
              "Абонаментът не можа да бъде потвърден."
          );
          return;
        }

        setConfirmedPlan(result.plan || null);
        setStatus("success");
        setMessage(
          "Premium абонаментът е активиран успешно."
        );
      } catch (error) {
        console.error(error);

        setStatus("error");
        setMessage(
          "Грешка при свързване със сървъра."
        );
      }
    }

    void confirmSubscription();
  }, [sessionId]);

  function getPlanName() {
    if (confirmedPlan === "premium_monthly") {
      return "Premium месечен";
    }

    if (confirmedPlan === "premium_yearly") {
      return "Premium годишен";
    }

    return "Premium";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-6xl">
          {status === "loading"
            ? "⏳"
            : status === "success"
            ? "✅"
            : "❌"}
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          {status === "loading"
            ? "Потвърждаваме плащането"
            : status === "success"
            ? "Плащането е успешно"
            : "Проблем с потвърждението"}
        </h1>

        <p
          className={`mt-5 text-lg ${
            status === "error"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {message}
        </p>

        {status === "success" && (
          <p className="mt-3 font-semibold text-green-700">
            Активен план: {getPlanName()}
          </p>
        )}

        {sessionId && (
          <p className="mt-5 break-all text-xs text-gray-400">
            Stripe сесия: {sessionId}
          </p>
        )}

        {status !== "loading" && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/plan"
              className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              Виж плана
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-gray-800 px-7 py-4 font-semibold text-white"
            >
              Към Dashboard
            </Link>

            {status === "error" && (
              <Link
                href="/payments"
                className="rounded-xl bg-red-600 px-7 py-4 font-semibold text-white"
              >
                Моите плащания
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}