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

  const storeSlug =
    searchParams.get("store_slug");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Confirming your payment..."
  );

  useEffect(() => {
    async function confirmPayment() {
      if (!sessionId || !checkoutId) {
        setStatus("error");
        setMessage(
          "Stripe session or order information is missing."
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
  language: "en",
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
            "The payment could not be confirmed."
          );
          return;
        }

        clearCart();

        setStatus("success");
        setMessage(
          "Your payment has been confirmed and the order has been marked as paid."
        );
      } catch (error) {
        console.error(error);

        setStatus("error");
        setMessage(
          "There was an error connecting to the server."
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

        {checkoutId && (
          <p className="mt-5 break-all text-xs text-gray-400">
            Order number:{" "}
            {checkoutId}
          </p>
        )}

        {sessionId && (
          <p className="mt-2 break-all text-xs text-gray-400">
            Stripe session: {sessionId}
          </p>
        )}

        {status !== "loading" && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={
                storeSlug
                  ? `/en/store/${storeSlug}`
                  : "/en"
              }
              className="rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white"
            >
              Continue shopping
            </Link>

            {status === "error" && (
              <Link
                href="/en/cart"
                className="rounded-xl bg-gray-800 px-7 py-4 font-semibold text-white"
              >
                Back to cart
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
        <div className="text-6xl">⏳</div>

        <h1 className="mt-6 text-4xl font-bold">
          Loading...
        </h1>

        <p className="mt-5 text-lg text-gray-600">
          Checking the payment information.
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
