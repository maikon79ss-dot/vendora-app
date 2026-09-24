"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  minimum_order: number | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export default function CouponsPage() {
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeSlug, setStoreSlug] = useState("");

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/en/login");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_slug")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    setStoreSlug(profile.store_slug);

    const { data, error } = await supabase
      .from("discount_coupons")
      .select("*")
      .eq("store_slug", profile.store_slug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setCoupons(data ?? []);
    }

    setLoading(false);
  }

  async function createCoupon() {
    setMessage("");

    const normalizedCode = code.trim().toUpperCase();

    if (!storeSlug) {
      setMessage("The store could not be found.");
      return;
    }

    if (!normalizedCode) {
      setMessage("Enter a coupon code.");
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      setMessage("Enter a valid discount value.");
      return;
    }

    if (
      discountType === "percent" &&
      Number(discountValue) > 100
    ) {
      setMessage("The percentage discount cannot exceed 100%.");
      return;
    }

    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setMessage("You must be logged in to your account.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("discount_coupons")
      .insert({
        owner_id: session.user.id,
        store_slug: storeSlug,
        code: normalizedCode,
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order: minimumOrder
          ? Number(minimumOrder)
          : 0,
        max_uses: maxUses
          ? Number(maxUses)
          : null,
        used_count: 0,
        expires_at: expiresAt
          ? new Date(expiresAt).toISOString()
          : null,
        is_active: true,
      });

    if (error) {
      console.error("Error creating coupon:", error);

      setMessage(
        `The coupon could not be created: ${error.message}`
      );

      setSaving(false);
      return;
    }

    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinimumOrder("");
    setMaxUses("");
    setExpiresAt("");

    setMessage("✅ Coupon created successfully.");

    await loadCoupons();

    setSaving(false);
  }

  async function toggleCoupon(coupon: Coupon) {
    setMessage("");

    const { error } = await supabase
      .from("discount_coupons")
      .update({
        is_active: !coupon.is_active,
      })
      .eq("id", coupon.id);

    if (error) {
      console.error("Error updating coupon:", error);
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage(
      coupon.is_active
        ? `Coupon ${coupon.code} has been deactivated.`
        : `Coupon ${coupon.code} has been activated.`
    );

    await loadCoupons();
  }

  async function deleteCoupon(coupon: Coupon) {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon ${coupon.code}?`
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("discount_coupons")
      .delete()
      .eq("id", coupon.id);

    if (error) {
      console.error("Error deleting coupon:", error);
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage(`Coupon ${coupon.code} has been deleted.`);
    await loadCoupons();
  }

  if (loading) {
    return (
      <main
        lang="en"
        className="min-h-screen bg-gray-100 p-10"
      >
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-10"
    >
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">🎟 Coupons</h1>

        <p className="mt-2 text-gray-600">
          Create and manage promotional codes for your store.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">
            ➕ Create a new coupon
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase())
              }
              placeholder="Code, for example WELCOME10"
              className="rounded-lg border p-3"
            />

            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(
                  e.target.value as "percent" | "fixed"
                )
              }
              className="rounded-lg border p-3"
            >
              <option value="percent">
                Percentage discount
              </option>
              <option value="fixed">
                Fixed amount
              </option>
            </select>

            <input
              value={discountValue}
              onChange={(e) =>
                setDiscountValue(e.target.value)
              }
              placeholder="Discount value"
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border p-3"
            />

            <input
              value={minimumOrder}
              onChange={(e) =>
                setMinimumOrder(e.target.value)
              }
              placeholder="Minimum order"
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border p-3"
            />

            <input
              value={maxUses}
              onChange={(e) =>
                setMaxUses(e.target.value)
              }
              placeholder="Maximum number of uses"
              type="number"
              min="1"
              className="rounded-lg border p-3"
            />

            <input
              value={expiresAt}
              onChange={(e) =>
                setExpiresAt(e.target.value)
              }
              type="datetime-local"
              className="rounded-lg border p-3"
            />
          </div>

          <button
            type="button"
            onClick={createCoupon}
            disabled={saving}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create coupon"}
          </button>

          {message && (
            <p className="mt-4 font-semibold">{message}</p>
          )}
        </div>

        <div className="mt-8 grid gap-4">
          {coupons.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow">
              No coupons have been created yet.
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {coupon.code}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {coupon.discount_type === "percent"
                        ? `${coupon.discount_value}% discount`
                        : `${coupon.discount_value} € discount`}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Used: {coupon.used_count}
                      {coupon.max_uses !== null
                        ? ` of ${coupon.max_uses}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleCoupon(coupon)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        coupon.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {coupon.is_active
                        ? "Active"
                        : "Inactive"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCoupon(coupon)
                      }
                      className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
