"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Payment = {
  id: number;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
};

export default function PaymentsPageEn() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/en/login");
      return;
    }

    const { data, error } = await supabase
      .from("subscription_payments")
      .select("*")
      .eq("user_id", session.user.id)
      .order("paid_at", { ascending: false });

    if (!error) {
      setPayments(data || []);
    }

    setLoading(false);
  }

  async function openCustomerPortal() {
    try {
      setPortalLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/en/login");
        return;
      }

      const response = await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "x-vendora-language": "en",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          "Unable to open subscription management."
        );
        return;
      }

      if (!data.url) {
        setMessage(
          "Stripe did not return a Customer Portal URL."
        );
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setMessage(
        "Error while connecting to Stripe."
      );
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        lang="en"
        className="p-10"
      >
        Loading...
      </main>
    );
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-10"
    >
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold">
          💳 My Payments
        </h1>

        <p className="mt-3 text-gray-500">
          Your Premium subscription payment history.
        </p>

        <section className="mt-8 rounded-2xl bg-blue-50 p-6">
          <h2 className="text-2xl font-bold">
            ⭐ Subscription Management
          </h2>

          <p className="mt-3 text-gray-600">
            Update your payment card, view invoices or
            manage your subscription.
          </p>

          <button
            type="button"
            onClick={openCustomerPortal}
            disabled={portalLoading}
            className="mt-5 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white disabled:opacity-50"
          >
            {portalLoading
              ? "Opening..."
              : "Manage subscription"}
          </button>

          {message && (
            <p className="mt-4 font-semibold text-red-600">
              {message}
            </p>
          )}
        </section>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b"
                >
                  <td className="py-4">
                    {new Date(
                      payment.paid_at
                    ).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    {payment.plan ===
                    "premium_monthly"
                      ? "Premium Monthly"
                      : payment.plan ===
                        "premium_yearly"
                      ? "Premium Yearly"
                      : payment.plan}
                  </td>

                  <td>
                    {payment.amount}{" "}
                    {payment.currency.toUpperCase()}
                  </td>

                  <td>
                    <span className="rounded-lg bg-green-100 px-3 py-1 text-green-700">
                      {payment.status === "paid"
                        ? "Paid"
                        : payment.status}
                    </span>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-gray-500"
                  >
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
