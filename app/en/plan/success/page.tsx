"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type ConfirmationStatus =
  | "loading"
  | "success"
  | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const sessionId =
    searchParams.get("session_id");

  const [status, setStatus] =
    useState<ConfirmationStatus>(
      "loading"
    );

  const [message, setMessage] =
    useState(
      "Confirming your subscription..."
    );

  const [
    confirmedPlan,
    setConfirmedPlan,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function confirmSubscription() {
      if (!sessionId) {
        setStatus("error");

        setMessage(
          "Stripe Session ID is missing."
        );

        return;
      }

      try {
        const response = await fetch(
          "/api/stripe/confirm-subscription",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sessionId,
            }),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          console.error(
            "Confirm subscription error:",
            result
          );

          setStatus("error");

          setMessage(
            "The subscription could not be confirmed."
          );

          return;
        }

        setConfirmedPlan(
          result.plan || null
        );

        setStatus("success");

        setMessage(
          "Your Premium subscription has been activated successfully."
        );
      } catch (error) {
        console.error(error);

        setStatus("error");

        setMessage(
          "There was an error connecting to the server."
        );
      }
    }

    void confirmSubscription();
  }, [sessionId]);

  function getPlanName() {
    if (
      confirmedPlan ===
      "premium_monthly"
    ) {
      return "Premium Monthly";
    }

    if (
      confirmedPlan ===
      "premium_yearly"
    ) {
      return "Premium Yearly";
    }

    return "Premium";
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-6 md:p-10"
    >
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
            ? "Confirming payment"
            : status === "success"
            ? "Payment successful"
            : "Payment confirmation problem"}
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
            Active plan:{" "}
            {getPlanName()}
          </p>
        )}

        {sessionId && (
          <p className="mt-5 break-all text-xs text-gray-400">
            Stripe session:{" "}
            {sessionId}
          </p>
        )}

        {status !== "loading" && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/en/plan"
              className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              View plans
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl bg-gray-800 px-7 py-4 font-semibold text-white"
            >
              Go to Dashboard
            </Link>

            {status === "error" && (
              <Link
                href="/en/plan"
                className="rounded-xl bg-red-600 px-7 py-4 font-semibold text-white"
              >
                Back to plans
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function LoadingPaymentPage() {
  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-6 md:p-10"
    >
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-6xl">
          ⏳
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          Loading...
        </h1>

        <p className="mt-5 text-lg text-gray-600">
          Checking your subscription.
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPageEn() {
  return (
    <Suspense
      fallback={
        <LoadingPaymentPage />
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
