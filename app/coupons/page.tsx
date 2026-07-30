"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Coupon = {
  id: number;
  owner_id: string;
  store_slug: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  minimum_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function CouponsPage() {
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userId, setUserId] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
const [subscriptionPlan, setSubscriptionPlan] = useState("free");
const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const currentUserId = session.user.id;

    const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("store_slug, subscription_plan")
  .eq("id", currentUserId)
  .single();

    if (profileError || !profile) {
      console.error(profileError);
      setMessage("Грешка при зареждане на профила.");
      return;
    }

    setUserId(currentUserId);
    setStoreSlug(profile.store_slug);
setSubscriptionPlan(profile.subscription_plan || "free");
    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("owner_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Грешка при зареждане на купоните.");
      return;
    }

    setCoupons(data || []);
    setLoading(false);
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    const value = Number(discountValue);
    const minimum = Number(minimumOrder || 0);
    const maximumUses =
      maxUses.trim() === "" ? null : Number(maxUses);

    if (!normalizedCode) {
      setMessage("Въведете код на купона.");
      return;
    }

    if (!value || value <= 0) {
      setMessage("Отстъпката трябва да бъде по-голяма от 0.");
      return;
    }

    if (discountType === "percent" && value > 100) {
      setMessage("Процентната отстъпка не може да е над 100%.");
      return;
    }

    if (minimum < 0) {
      setMessage("Минималната стойност не може да бъде отрицателна.");
      return;
    }

    if (
      maximumUses !== null &&
      (!Number.isInteger(maximumUses) || maximumUses < 1)
    ) {
      setMessage(
        "Максималният брой използвания трябва да е цяло число над 0."
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("discount_coupons")
      .insert([
        {
          owner_id: userId,
          store_slug: storeSlug,
          code: normalizedCode,
          discount_type: discountType,
          discount_value: value,
          minimum_order: minimum,
          max_uses: maximumUses,
          expires_at: expiresAt
            ? new Date(`${expiresAt}T23:59:59`).toISOString()
            : null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        setMessage("Вече съществува купон с този код.");
      } else {
        setMessage("Грешка при създаване на купона.");
      }

      setIsSaving(false);
      return;
    }

    setCoupons((currentCoupons) => [
      data,
      ...currentCoupons,
    ]);

    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinimumOrder("0");
    setMaxUses("");
    setExpiresAt("");
    setMessage("Купонът е създаден успешно.");
    setIsSaving(false);
  }

  async function toggleCoupon(coupon: Coupon) {
    const newStatus = !coupon.is_active;

    const { error } = await supabase
      .from("discount_coupons")
      .update({ is_active: newStatus })
      .eq("id", coupon.id)
      .eq("owner_id", userId);

    if (error) {
      console.error(error);
      alert("Грешка при промяна на статуса.");
      return;
    }

    setCoupons((currentCoupons) =>
      currentCoupons.map((currentCoupon) =>
        currentCoupon.id === coupon.id
          ? {
              ...currentCoupon,
              is_active: newStatus,
            }
          : currentCoupon
      )
    );
  }

  async function deleteCoupon(id: number) {
    const confirmed = window.confirm(
      "Сигурни ли сте, че искате да изтриете този купон?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("discount_coupons")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      console.error(error);
      alert("Грешка при изтриване на купона.");
      return;
    }

    setCoupons((currentCoupons) =>
      currentCoupons.filter((coupon) => coupon.id !== id)
    );
  }

  function isExpired(coupon: Coupon) {
    if (!coupon.expires_at) return false;

    return new Date(coupon.expires_at).getTime() < Date.now();
  }

  function isUsageLimitReached(coupon: Coupon) {
    if (coupon.max_uses === null) return false;

    return coupon.used_count >= coupon.max_uses;
  }
if (loading) {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      Зареждане...
    </main>
  );
}

const isPremium =
  subscriptionPlan === "premium_monthly" ||
  subscriptionPlan === "premium_yearly";

if (!isPremium) {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow">
        <h1 className="text-4xl font-bold">
          🔒 Premium функция
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Купоните за отстъпка са достъпни само за Premium потребители.
        </p>

        <p className="mt-3 text-gray-500">
          Надстройте плана си, за да създавате купони и промоционални кампании.
        </p>

        <button
          type="button"
          onClick={() => router.push("/plan")}
          className="mt-8 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white"
        >
          ⭐ Виж плановете
        </button>
      </div>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">
          🎟 Купони за отстъпка
        </h1>

        <p className="mt-3 text-gray-600">
          Създавайте кодове за процентна или фиксирана отстъпка.
        </p>

        <form
          onSubmit={createCoupon}
          className="mt-8 rounded-2xl bg-white p-8 shadow"
        >
          <h2 className="text-2xl font-bold">Нов купон</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="block font-semibold">
                Код на купона
              </label>

              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Например: WELCOME10"
                className="mt-2 w-full rounded-lg border p-3 uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold">
                Тип отстъпка
              </label>

              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(
                    e.target.value as "percent" | "fixed"
                  )
                }
                className="mt-2 w-full rounded-lg border p-3"
              >
                <option value="percent">
                  Процентна отстъпка
                </option>

                <option value="fixed">
                  Фиксирана сума
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold">
                Стойност на отстъпката
              </label>

              <input
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(e.target.value)
                }
                type="number"
                min="0.01"
                step="0.01"
                placeholder={
                  discountType === "percent"
                    ? "Например: 10"
                    : "Например: 5"
                }
                className="mt-2 w-full rounded-lg border p-3"
              />

              <p className="mt-2 text-sm text-gray-500">
                {discountType === "percent"
                  ? "Стойността е в проценти."
                  : "Стойността е в евро."}
              </p>
            </div>

            <div>
              <label className="block font-semibold">
                Минимална стойност на поръчката
              </label>

              <input
                value={minimumOrder}
                onChange={(e) =>
                  setMinimumOrder(e.target.value)
                }
                type="number"
                min="0"
                step="0.01"
                className="mt-2 w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="block font-semibold">
                Максимален брой използвания
              </label>

              <input
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                type="number"
                min="1"
                step="1"
                placeholder="Оставете празно за неограничено"
                className="mt-2 w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="block font-semibold">
                Валиден до
              </label>

              <input
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                type="date"
                className="mt-2 w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? "Създаване..." : "Създай купон"}
          </button>

          {message && (
            <p className="mt-4 font-semibold">{message}</p>
          )}
        </form>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">
            Създадени купони
          </h2>

          {coupons.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white p-8 text-gray-500 shadow">
              Все още няма създадени купони.
            </div>
          ) : (
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon);
                const usageLimitReached =
                  isUsageLimitReached(coupon);

                const unavailable =
                  !coupon.is_active ||
                  expired ||
                  usageLimitReached;

                return (
                  <article
                    key={coupon.id}
                    className="rounded-2xl bg-white p-6 shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Код
                        </p>

                        <h3 className="mt-1 text-3xl font-bold">
                          {coupon.code}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          unavailable
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {expired
                          ? "Изтекъл"
                          : usageLimitReached
                          ? "Лимитът е достигнат"
                          : coupon.is_active
                          ? "Активен"
                          : "Спрян"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-gray-700">
                      <p>
                        Отстъпка:{" "}
                        <strong>
                          {coupon.discount_type === "percent"
                            ? `${coupon.discount_value}%`
                            : `${Number(
                                coupon.discount_value
                              ).toFixed(2)} €`}
                        </strong>
                      </p>

                      <p>
                        Минимална поръчка:{" "}
                        <strong>
                          {Number(
                            coupon.minimum_order || 0
                          ).toFixed(2)}{" "}
                          €
                        </strong>
                      </p>

                      <p>
                        Използвания:{" "}
                        <strong>
                          {coupon.used_count}
                          {coupon.max_uses !== null
                            ? ` / ${coupon.max_uses}`
                            : " / неограничено"}
                        </strong>
                      </p>

                      <p>
                        Валиден до:{" "}
                        <strong>
                          {coupon.expires_at
                            ? new Date(
                                coupon.expires_at
                              ).toLocaleDateString("bg-BG")
                            : "Без срок"}
                        </strong>
                      </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCoupon(coupon)}
                        className={`flex-1 rounded-lg py-3 text-white ${
                          coupon.is_active
                            ? "bg-orange-500"
                            : "bg-green-600"
                        }`}
                      >
                        {coupon.is_active
                          ? "Спри купона"
                          : "Активирай купона"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCoupon(coupon.id)
                        }
                        className="rounded-lg bg-red-600 px-5 py-3 text-white"
                      >
                        🗑
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}