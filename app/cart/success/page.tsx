"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

function CartPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const sessionId =
    searchParams.get("session_id");

  const checkoutId =
    searchParams.get("checkout_id");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Потвърждаваме плащането..."
  );

  useEffect(() => {
    async function confirmPayment() {
      if (!sessionId || !checkoutId) {
        setStatus("error");
        setMessage(
          "Липсват данни за Stripe сесията или поръчката."
        );
        return;
      }

      try {
        const response = await fetch(
          "/api/stripe/confirm-store-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              checkoutId,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error(
            "Confirm store payment error:",
            result
          );

          setStatus("error");
          setMessage(
            result.error ||
              "Плащането не можа да бъде потвърдено."
          );
          return;
        }

        clearCart();

        setStatus("success");
        setMessage(
          "Плащането е потвърдено и поръчката е отбелязана като платена."
        );
      } catch (error) {
        console.error(error);

        setStatus("error");
        setMessage(
          "Грешка при свързване със сървъра."
        );
      }
    }

    void confirmPayment();
  }, [
    sessionId,
    checkoutId,
    clearCart,
  ]);

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

        {checkoutId && (
          <p className="mt-5 break-all text-xs text-gray-400">
            Номер на поръчката:{" "}
            {checkoutId}
          </p>
        )}

        {sessionId && (
          <p className="mt-2 break-all text-xs text-gray-400">
            Stripe сесия: {sessionId}
          </p>
        )}

        {status !== "loading" && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              Продължи пазаруването
            </Link>

            {status === "error" && (
              <Link
                href="/cart"
                className="rounded-xl bg-gray-800 px-7 py-4 font-semibold text-white"
              >
                Към количката
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
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-6xl">⏳</div>

        <h1 className="mt-6 text-4xl font-bold">
          Зареждане...
        </h1>

        <p className="mt-5 text-lg text-gray-600">
          Проверяваме данните за плащането.
        </p>
      </div>
    </main>
  );
}

export default function CartPaymentSuccessPage() {
  return (
    <Suspense
      fallback={<LoadingPaymentPage />}
    >
      <CartPaymentSuccessContent />
    </Suspense>
  );
}