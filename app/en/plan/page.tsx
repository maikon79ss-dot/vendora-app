"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Plan =
  | "free"
  | "premium_monthly"
  | "premium_yearly";

export default function PlanPageEn() {
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
        "Error while checking your user session."
      );
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/en/login");
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
        "Unable to load your current plan."
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
        router.push("/en/login");
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
            "Unable to create the payment."
        );
        return;
      }

      if (!data.url) {
        setMessage(
          "Stripe did not return a payment URL."
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
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Unable to open your subscription."
        );
        return;
      }

      if (!data.url) {
        setMessage(
          "Stripe did not return a management URL."
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
  className="flex min-h-screen items-center justify-center bg-gray-100"
>
        <p className="text-lg font-semibold text-gray-600">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main
  lang="en"
  className="min-h-screen bg-gray-100 px-6 py-12"
>
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            ⭐ Plans
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Choose the best plan for your store.
          </p>

          {promoActive && (
            <div className="mx-auto mt-5 inline-flex rounded-full bg-orange-100 px-5 py-2 font-semibold text-orange-700">
              🔥 Limited launch offer
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
                / forever
              </span>
            </div>

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ Up to 5 products</li>
              <li>✅ Basic theme</li>
              <li>✅ Personal store page</li>
              <li>✅ Basic statistics</li>
            </ul>

            <button
              type="button"
              disabled
              className="mt-8 rounded-xl bg-gray-200 px-6 py-4 font-semibold text-gray-600"
            >
              {currentPlan === "free"
                ? "Current plan"
                : "Free plan"}
            </button>
          </section>

          {/* Monthly */}
          <section className="relative flex flex-col rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white">
              Most popular
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
                / month
              </span>
            </div>

            {promoActive && (
              <p className="mt-3 font-semibold text-orange-600">
                Promotional launch price
              </p>
            )}

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ Unlimited products</li>
              <li>✅ All themes and banners</li>
              <li>✅ Advanced statistics</li>
              <li>✅ Priority support</li>
              <li>✅ No platform ads</li>
            </ul>

            {currentPlan === "premium_monthly" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="mt-8 rounded-xl bg-green-100 px-6 py-4 font-bold text-green-700"
                >
                  Current plan
                </button>

                <button
                  type="button"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="mt-3 rounded-xl border border-red-500 px-6 py-4 font-semibold text-red-600 disabled:opacity-50"
                >
                  {portalLoading
                    ? "Opening..."
                    : "Cancel subscription"}
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
                  ? "Opening Stripe..."
                  : "Get monthly plan"}
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
                / year
              </span>
            </div>

            {promoActive ? (
              <p className="mt-3 font-semibold text-orange-600">
                Only about €3.33 per month
              </p>
            ) : (
              <p className="mt-3 font-semibold text-green-600">
                Save with the yearly plan
              </p>
            )}

            <ul className="mt-8 flex-1 space-y-4 text-gray-700">
              <li>✅ Everything in Premium Monthly</li>
              <li>✅ Unlimited products</li>
              <li>✅ All Premium templates</li>
              <li>✅ Advanced statistics</li>
              <li>✅ Priority support</li>
            </ul>

            {currentPlan === "premium_yearly" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="mt-8 rounded-xl bg-green-100 px-6 py-4 font-bold text-green-700"
                >
                  Current plan
                </button>

                <button
                  type="button"
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="mt-3 rounded-xl border border-red-500 px-6 py-4 font-semibold text-red-600 disabled:opacity-50"
                >
                  {portalLoading
                    ? "Opening..."
                    : "Manage subscription"}
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
                  ? "Opening Stripe..."
                  : "Get yearly plan"}
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
