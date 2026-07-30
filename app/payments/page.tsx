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

export default function PaymentsPage() {
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
      router.push("/login");
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
      router.push("/login");
      return;
    }

    const response = await fetch("/api/stripe/customer-portal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error || "Грешка при отваряне на управлението на абонамента."
      );
      return;
    }

    if (!data.url) {
      setMessage("Stripe не върна адрес за Customer Portal.");
      return;
    }

    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    setMessage("Грешка при свързване със Stripe.");
  } finally {
    setPortalLoading(false);
  }
}
  if (loading) {
    return (
      <main className="p-10">
        Зареждане...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold">
          💳 Моите плащания
        </h1>

        <p className="mt-3 text-gray-500">
          История на Premium абонаментите.
        </p>
<section className="mt-8 rounded-2xl bg-blue-50 p-6">
  <h2 className="text-2xl font-bold">
    ⭐ Управление на абонамента
  </h2>

  <p className="mt-3 text-gray-600">
    Променете картата си, вижте фактурите или прекратете абонамента.
  </p>

  <button
    type="button"
    onClick={openCustomerPortal}
    disabled={portalLoading}
    className="mt-5 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white disabled:opacity-50"
  >
    {portalLoading
      ? "Отваряне..."
      : "Управление на абонамента"}
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
                <th className="py-3">Дата</th>
                <th>План</th>
                <th>Сума</th>
                <th>Статус</th>
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
                    ).toLocaleDateString()}
                  </td>

                  <td>
  {payment.plan === "premium_monthly"
    ? "Premium месечен"
    : payment.plan === "premium_yearly"
    ? "Premium годишен"
    : payment.plan}
</td>

                  <td>
                    {payment.amount}{" "}
                    {payment.currency.toUpperCase()}
                  </td>

                  <td>
                    <span className="rounded-lg bg-green-100 px-3 py-1 text-green-700">
                      {payment.status === "paid"
  ? "Платено"
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
                    Все още няма плащания.
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