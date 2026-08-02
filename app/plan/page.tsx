"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Plan =
  | "free"
  | "premium_monthly"
  | "premium_yearly";

export default function PlanPage() {
  const router = useRouter();

  const [currentPlan, setCurrentPlan] =
    useState<Plan>("free");

  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] =
    useState<Plan | null>(null);

  const [portalLoading, setPortalLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  const promoActive =
    process.env.NEXT_PUBLIC_PROMO_ACTIVE === "true";

  const monthlyPrice = promoActive ? "4.99" : "9.99";
  const yearlyPrice = promoActive ? "40" : "99";

  useEffect(() => {
    void loadCurrentPlan();
  }, []);

  async function loadCurrentPlan() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);
      setMessage(
        "Грешка при проверка на потребителската сесия."
      );
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error(error);
      setMessage(
        "Неуспешно зареждане на текущия план."
      );
      setLoading(false);
      return;
    }

    const loadedPlan = data?.subscription_plan;

    if (
      loadedPlan === "premium_monthly" ||
      loadedPlan === "premium_yearly"
    ) {
      setCurrentPlan(loadedPlan);
    } else {
      setCurrentPlan("free");
    }

    setLoading(false);
  }

  async function startCheckout(
    plan: "premium_monthly" | "premium_yearly"
  ) {
    try {
      setCheckoutPlan(plan);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Неуспешно създаване на плащането."
        );
        return;
      }

      if (!data.url) {
        setMessage(
          "Stripe не върна адрес за плащане."
        );
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setMessage(
        "Грешка при свързване със Stripe."
      );
    } finally {
      setCheckoutPlan(null);
    }
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

      const response = await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Неуспешно отваряне на абонамента."
        );
        return;
      }

      if (!data.url) {
        setMessage(
          "Stripe не върна адрес за управление."
        );
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setMessage(
        "Грешка при свързване със Stripe."
      );
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Зареждане...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            ⭐ Планове
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Изберете най-подходящия план за вашия
            магазин.
          </p>

          {promoActive && (
            <div className="mx-auto mt-5 inline-flex rounded-full bg-orange-100 px-5 py-2 font-semibold text-orange-700">
              🔥 Ограничена стартова промоция
            </div>
          )}
        </div>

        {message && (
          <p className="mx-auto mt-8 max-w-3xl rounded-xl bg-red-50 p-4 text-center font-semibold text-red-700">
            {message}
          </p>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Free */}
          <section className="flex flex-col rounded-3xl bg-white p-8 shadow">
            <h2 className="text-3xl font-bold">
              Free
            </h2>

            <div className="mt-5">
              <span className="text-5xl font-extrabold">
                0 €
              </span>

              <span className="text-gray-500">
                {" "}
                / завинаги
              </span>
            </div>

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ До 5 продукта</li>
              <li>✅ Основна тема</li>
              <li>✅ Персонална страница на магазина</li>
              <li>✅ Основни статистики</li>
            </ul>

            <button
              type="button"
              disabled
              className="mt-8 rounded-xl bg-gray-200 px-6 py-4 font-semibold text-gray-600"
            >
              {currentPlan === "free"
                ? "Текущ план"
                : "Безплатен план"}
            </button>
          </section>

          {/* Monthly */}
          <section className="relative flex flex-col rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white">
              Най-популярен
            </div>

            <h2 className="text-3xl font-bold">
              Premium Monthly
            </h2>

            <div className="mt-5">
              {promoActive && (
                <p className="mb-1 text-xl text-gray-400 line-through">
                  9.99 €
                </p>
              )}

              <span className="text-5xl font-extrabold text-blue-600">
                {monthlyPrice} €
              </span>

              <span className="text-gray-500">
                {" "}
                / месец
              </span>
            </div>

            {promoActive && (
              <p className="mt-3 font-semibold text-orange-600">
                Промоционална стартова цена
              </p>
            )}

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ Неограничени продукти</li>
              <li>✅ Всички теми и банери</li>
              <li>✅ Разширени статистики</li>
              <li>✅ Приоритетна поддръжка</li>
              <li>✅ Без реклами на платформата</li>
            </ul>

            {currentPlan === "premium_monthly" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="mt-8 rounded-xl bg-green-100 px-6 py-4 font-bold text-green-700"
                >
                  Текущ план
                </button>

                <button
                  type="button"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="mt-3 rounded-xl border border-red-500 px-6 py-4 font-semibold text-red-600 disabled:opacity-50"
                >
                  {portalLoading
                    ? "Отваряне..."
                    : "Отпиши се"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  startCheckout("premium_monthly")
                }
                disabled={
                  checkoutPlan !== null ||
                  currentPlan === "premium_yearly"
                }
                className="mt-8 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutPlan === "premium_monthly"
                  ? "Отваряне на Stripe..."
                  : "Вземи месечен план"}
              </button>
            )}
          </section>

          {/* Yearly */}
          <section className="flex flex-col rounded-3xl bg-white p-8 shadow">
            <h2 className="text-3xl font-bold">
              Premium Yearly
            </h2>

            <div className="mt-5">
              {promoActive && (
                <p className="mb-1 text-xl text-gray-400 line-through">
                  99 €
                </p>
              )}

              <span className="text-5xl font-extrabold text-purple-600">
                {yearlyPrice} €
              </span>

              <span className="text-gray-500">
                {" "}
                / година
              </span>
            </div>

            {promoActive ? (
              <p className="mt-3 font-semibold text-orange-600">
                Само около 3.33 € на месец
              </p>
            ) : (
              <p className="mt-3 font-semibold text-green-600">
                Спестявате с годишния план
              </p>
            )}

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ Всичко от Premium Monthly</li>
              <li>✅ Неограничени продукти</li>
              <li>✅ Всички Premium шаблони</li>
              <li>✅ Разширени статистики</li>
              <li>✅ Приоритетна поддръжка</li>
            </ul>

            {currentPlan === "premium_yearly" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="mt-8 rounded-xl bg-green-100 px-6 py-4 font-bold text-green-700"
                >
                  Текущ план
                </button>

                <button
                  type="button"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="mt-3 rounded-xl border border-red-500 px-6 py-4 font-semibold text-red-600 disabled:opacity-50"
                >
                  {portalLoading
                    ? "Отваряне..."
                   : "Управлявай абонамента" }
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() =>
                  startCheckout("premium_yearly")
                }
                disabled={
                  checkoutPlan !== null ||
                  currentPlan === "premium_monthly"
                }
                className="mt-8 rounded-xl bg-purple-600 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutPlan === "premium_yearly"
                  ? "Отваряне на Stripe..."
                  : "Вземи годишен план"}
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}