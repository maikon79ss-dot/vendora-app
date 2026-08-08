"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabaseClient";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
  } = useCart();

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
const [paymentMethod, setPaymentMethod] =
  useState("");

const [paymentSettings, setPaymentSettings] =
  useState({
    stripe: false,
    paypal: false,
    revolut: false,
    bankTransfer: false,
    cod: true,
  });

const [paymentLinks, setPaymentLinks] =
  useState({
    paypal: "",
    revolut: "",
    bankHolder: "",
    bankIban: "",
    bankName: "",
  });

const [bankTransferInfo, setBankTransferInfo] =
  useState<{
    holder: string;
    iban: string;
    bankName: string;
    amount: number;
    checkoutId: string;
  } | null>(null);

const [message, setMessage] = useState("");
const [isSubmitting, setIsSubmitting] =
  useState(false);

const [couponCode, setCouponCode] =
  useState("");

const [discountAmount, setDiscountAmount] =
  useState(0);

const [appliedCoupon, setAppliedCoupon] =
  useState("");

const [
  continueShoppingUrl,
  setContinueShoppingUrl,
] = useState("/products");
useEffect(() => {
  const currentStoreSlug = cartItems[0]?.storeSlug;

  if (currentStoreSlug) {
    const storeUrl = `/store/${currentStoreSlug}`;

    setContinueShoppingUrl(storeUrl);

    localStorage.setItem(
      "vendora_last_store_url",
      storeUrl
    );

    return;
  }

  const savedStoreUrl = localStorage.getItem(
    "vendora_last_store_url"
  );

  if (savedStoreUrl) {
    setContinueShoppingUrl(savedStoreUrl);
  }
}, [cartItems]);

useEffect(() => {
  async function loadPaymentSettings() {
    if (cartItems.length === 0) return;

    const ownerId = cartItems[0].ownerId;

    const { data, error } = await supabase
      .from("profiles")
      .select(`
  stripe_enabled,
  paypal_enabled,
  revolut_enabled,
  bank_transfer_enabled,
  cod_enabled,
  paypal_payment_link,
  revolut_payment_link,
  bank_account_holder,
  bank_iban,
  bank_name
`)
      .eq("id", ownerId)
      .single();

    if (error) {
      console.error(
        "Грешка при зареждане на плащанията:",
        error
      );
      return;
    }

    setPaymentSettings({
      stripe: data?.stripe_enabled ?? false,
      paypal: data?.paypal_enabled ?? false,
      revolut: data?.revolut_enabled ?? false,
      bankTransfer:
        data?.bank_transfer_enabled ?? false,
      cod: data?.cod_enabled ?? true,
    });
setPaymentLinks({
  paypal: data?.paypal_payment_link || "",
  revolut: data?.revolut_payment_link || "",
  bankHolder: data?.bank_account_holder || "",
  bankIban: data?.bank_iban || "",
  bankName: data?.bank_name || "",
});
    const methods: string[] = [];

    if (data?.stripe_enabled) {
      methods.push("Stripe");
    }

    if (data?.paypal_enabled) {
      methods.push("PayPal");
    }

    if (data?.revolut_enabled) {
      methods.push("Revolut");
    }

    if (data?.bank_transfer_enabled) {
      methods.push("Банков превод");
    }

    if (data?.cod_enabled) {
      methods.push("Наложен платеж");
    }

    if (methods.length > 0) {
      setPaymentMethod((currentMethod) => {
        if (
          currentMethod &&
          methods.includes(currentMethod)
        ) {
          return currentMethod;
        }

        return methods[0] ?? "";
      });
    }
  }

  void loadPaymentSettings();
}, [cartItems]);

const finalTotal = Math.max(
  0,
  cartTotal - discountAmount
);

async function sendOrderEmail(
  to: string,
  subject: string,
  message: string
) {
  const response = await fetch("/api/send-order-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      message,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Имейлът не беше изпратен:", result);

    throw new Error(
      result.error || "Неуспешно изпращане на имейла."
    );
  }

  console.log("Имейлът е изпратен:", result);
}
  async function getSellerEmail(ownerId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", ownerId)
    .single();

  if (error) {
    console.error(
      "Грешка при намиране на имейла на продавача:",
      error
    );
    return "";
  }

  return data?.email || "";
}
async function applyCoupon() {
  const normalizedCode = couponCode.trim().toUpperCase();

  if (!normalizedCode) {
    setMessage("Въведете код за отстъпка.");
    return;
  }

  const storeSlugs = Array.from(
    new Set(cartItems.map((item) => item.storeSlug))
  );

  if (storeSlugs.length !== 1) {
    setMessage(
      "Купонът може да се използва само за продукти от един магазин."
    );
    return;
  }

  const { data: coupon, error } = await supabase
    .from("discount_coupons")
    .select("*")
    .eq("store_slug", storeSlugs[0])
    .eq("code", normalizedCode)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(error);
    setMessage("Грешка при проверка на купона.");
    return;
  }

  if (!coupon) {
    setDiscountAmount(0);
    setAppliedCoupon("");
    setMessage("Невалиден или неактивен купон.");
    return;
  }

  if (
    coupon.expires_at &&
    new Date(coupon.expires_at).getTime() < Date.now()
  ) {
    setDiscountAmount(0);
    setAppliedCoupon("");
    setMessage("Срокът на този купон е изтекъл.");
    return;
  }

  if (
    coupon.max_uses !== null &&
    Number(coupon.used_count) >= Number(coupon.max_uses)
  ) {
    setDiscountAmount(0);
    setAppliedCoupon("");
    setMessage("Лимитът за използване на този купон е достигнат.");
    return;
  }

  if (cartTotal < Number(coupon.minimum_order || 0)) {
    setDiscountAmount(0);
    setAppliedCoupon("");
    setMessage(
      `Минималната стойност за този купон е ${Number(
        coupon.minimum_order
      ).toFixed(2)} €.`
    );
    return;
  }

  let calculatedDiscount = 0;

  if (coupon.discount_type === "percent") {
    calculatedDiscount =
      cartTotal * (Number(coupon.discount_value) / 100);
  } else {
    calculatedDiscount = Number(coupon.discount_value);
  }

  calculatedDiscount = Math.min(calculatedDiscount, cartTotal);

  setDiscountAmount(calculatedDiscount);
  setAppliedCoupon(normalizedCode);
  setMessage(
    `Купонът е приложен. Спестявате ${calculatedDiscount.toFixed(2)} €.`
  );
}

async function submitCheckout(e: React.FormEvent) {
  e.preventDefault();

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !address ||
    !city
  ) {
    setMessage("Моля, попълнете всички задължителни полета.");
    return;
  }

  if (cartItems.length === 0) {
    setMessage("Количката е празна.");
    return;
  }

  setIsSubmitting(true);
  setMessage("");

  const checkoutId = crypto.randomUUID();
  const checkoutCreatedAt = new Date().toISOString();

  const ordersToInsert = cartItems.map((item) => {
    const itemSubtotal = item.price * item.quantity;

    const itemDiscount =
      cartTotal > 0
        ? discountAmount * (itemSubtotal / cartTotal)
        : 0;

    const itemFinalPrice = Math.max(
      0,
      itemSubtotal - itemDiscount
    );

    return {
      checkout_id: checkoutId,
      owner_id: item.ownerId,
      product_id: item.productId,
      product_name: item.name,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      address,
      city,
      postal_code: postalCode,
      quantity: item.quantity,
      variant: item.variant,
      payment_method: paymentMethod,
      total_price: Number(itemFinalPrice.toFixed(2)),
      created_checkout_at: checkoutCreatedAt,
      status:
  paymentMethod === "Stripe"
    ? "Очаква плащане"
    : "Нова",
      stock_updated: false,
    };
  });

  const { error } = await supabase
    .from("orders")
    .insert(ordersToInsert);

  if (error) {
    console.error(error);
    setMessage("Грешка при изпращане на поръчката.");
    setIsSubmitting(false);
    return;
  }
  console.log(
  "SELECTED PAYMENT METHOD:",
  paymentMethod
);

if (paymentMethod === "Stripe") {
  const ownerIds = Array.from(
    new Set(
      cartItems.map((item) => item.ownerId)
    )
  );

  if (ownerIds.length !== 1) {
    setMessage(
      "Stripe плащането може да съдържа продукти само от един магазин."
    );
    setIsSubmitting(false);
    return;
  }

  try {
    const response = await fetch(
      "/api/stripe/store-checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutId,
          customerEmail,
          ownerId: ownerIds[0],
          discountAmount,
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variant: item.variant,
            ownerId: item.ownerId,
          })),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(
        "Store Stripe Checkout error:",
        result
      );

      setMessage(
        result.error ||
          "Неуспешно създаване на Stripe плащането."
      );

      setIsSubmitting(false);
      return;
    }

    if (!result.url) {
      setMessage(
        "Stripe не върна адрес за плащане."
      );
      setIsSubmitting(false);
      return;
    }

    window.location.href = result.url;
    return;
  } catch (stripeError) {
    console.error(stripeError);

    setMessage(
      "Грешка при свързване със Stripe."
    );

    setIsSubmitting(false);
    return;
  }
}

if (paymentMethod === "PayPal") {
  if (!paymentLinks.paypal) {
    setMessage(
      "Продавачът не е настроил PayPal."
    );
    setIsSubmitting(false);
    return;
  }

  window.location.href = paymentLinks.paypal;
  return;
}
if (paymentMethod === "Revolut") {
  if (!paymentLinks.revolut) {
    setMessage(
      "Продавачът не е настроил Revolut."
    );
    setIsSubmitting(false);
    return;
  }

  window.location.href = paymentLinks.revolut;
  return;
}
if (paymentMethod === "Банков превод") {
  if (
    !paymentLinks.bankHolder ||
    !paymentLinks.bankIban ||
    !paymentLinks.bankName
  ) {
    setMessage(
      "Продавачът не е попълнил данните за банков превод."
    );
    setIsSubmitting(false);
    return;
  }

  setBankTransferInfo({
    holder: paymentLinks.bankHolder,
    iban: paymentLinks.bankIban,
    bankName: paymentLinks.bankName,
    amount: finalTotal,
    checkoutId,
  });

  clearCart();
  setShowCheckoutForm(false);
  setCouponCode("");
  setAppliedCoupon("");
  setDiscountAmount(0);
 setMessage(
  "🏦 Очакваме банковия превод. След потвърждение поръчката ще бъде обработена."
);
  setIsSubmitting(false);
  return;
}
try {
  await sendOrderEmail(
    customerEmail,
    "Потвърждение за поръчка",
    `Здравейте, ${customerName}!

Благодарим за вашата поръчка.

Номер на поръчката: ${checkoutId}
Обща стойност: ${finalTotal.toFixed(2)} €
Начин на плащане: ${paymentMethod}

Ще получите нов имейл, когато статусът на поръчката бъде променен.

Поздрави,
Vendora`
  );
} catch (emailError) {
  console.error(emailError);

  setMessage(
    "Поръчката е записана, но имейлът не беше изпратен."
  );
}
  try {
  const sellerOwnerId = cartItems[0]?.ownerId;

  if (sellerOwnerId) {
    const sellerEmail = await getSellerEmail(
      sellerOwnerId
    );

    if (sellerEmail) {
      const productsText = cartItems
        .map(
          (item) =>
            `${item.name} × ${item.quantity}`
        )
        .join("\n");

      await sendOrderEmail(
        sellerEmail,
        "Нова поръчка във Vendora",
        `Получихте нова поръчка.

Клиент: ${customerName}
Имейл: ${customerEmail}
Телефон: ${customerPhone}
Адрес: ${address}, ${city}
Пощенски код: ${postalCode || "-"}

Продукти:
${productsText}

Обща стойност: ${finalTotal.toFixed(2)} €
Начин на плащане: ${paymentMethod}

Номер на поръчката: ${checkoutId}

Vendora`
      );
    }
  }
} catch (sellerEmailError) {
  console.error(
    "Имейлът към продавача не беше изпратен:",
    sellerEmailError
  );
}
  if (appliedCoupon) {
    const storeSlug = cartItems[0]?.storeSlug;

    const { data: coupon } = await supabase
      .from("discount_coupons")
      .select("id, used_count")
      .eq("store_slug", storeSlug)
      .eq("code", appliedCoupon)
      .maybeSingle();

    if (coupon) {
      await supabase
        .from("discount_coupons")
        .update({
          used_count: Number(coupon.used_count || 0) + 1,
        })
        .eq("id", coupon.id);
    }
  }

  clearCart();
  setShowCheckoutForm(false);
  setCouponCode("");
  setAppliedCoupon("");
  setDiscountAmount(0);
  setMessage("✅ Благодарим! Поръчката е изпратена успешно.");
  setIsSubmitting(false);
}

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow">
          <h1 className="text-4xl font-bold">🛒 Количка</h1>

          <p className="mt-6 text-lg text-gray-600">
            {message || "Количката е празна."}
          </p>
{bankTransferInfo && (
  <div className="mx-auto mt-8 max-w-xl rounded-2xl border bg-blue-50 p-6 text-left">
    <h2 className="text-2xl font-bold">
      Данни за банков превод
    </h2>

    <div className="mt-5 space-y-3">
      <p>
        <strong>Получател:</strong>{" "}
        {bankTransferInfo.holder}
      </p>

      <p>
        <strong>IBAN:</strong>{" "}
        {bankTransferInfo.iban}
      </p>

      <p>
        <strong>Банка:</strong>{" "}
        {bankTransferInfo.bankName}
      </p>

      <p>
        <strong>Сума:</strong>{" "}
        {bankTransferInfo.amount.toFixed(2)} €
      </p>

      <p>
        <strong>Основание:</strong>{" "}
        Поръчка {bankTransferInfo.checkoutId}
      </p>
    </div>

    <p className="mt-5 text-sm text-gray-600">
      Поръчката ще бъде обработена след потвърждение на превода от продавача.
    </p>
  </div>
)}
        <Link
  href={continueShoppingUrl}
  className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
>
  Продължи пазаруването
</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">🛒 Количка</h1>

            <p className="mt-2 text-gray-600">
              Общо продукти: {cartCount}
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="rounded-lg bg-red-600 px-5 py-3 text-white"
          >
            Изчисти количката
          </button>
        </div>

        <div className="grid gap-6">
          {cartItems.map((item) => (
            <div
              key={`${item.productId}-${item.variant}`}
              className="grid gap-6 rounded-2xl bg-white p-6 shadow md:grid-cols-[160px_1fr]"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                  Няма снимка
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold">{item.name}</h2>

                <p className="mt-2 text-gray-600">
                  Вариант: {item.variant}
                </p>

                <p className="mt-2 text-xl font-semibold text-blue-600">
                  {item.price.toFixed(2)} €
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variant,
                        item.quantity - 1
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="h-10 w-10 rounded-lg border text-xl disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="min-w-10 text-center text-lg font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variant,
                        item.quantity + 1
                      )
                    }
                    className="h-10 w-10 rounded-lg border text-xl"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.productId, item.variant)
                    }
                    className="ml-auto rounded-lg bg-red-600 px-5 py-2 text-white"
                  >
                    🗑 Премахни
                  </button>
                </div>

                <p className="mt-5 font-semibold">
                  Междинна сума:{" "}
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-gray-600">Обща стойност</p>

              {discountAmount > 0 && (
  <>
    <p className="mt-2 text-gray-500 line-through">
      {cartTotal.toFixed(2)} €
    </p>

    <p className="mt-2 font-semibold text-green-600">
      Отстъпка: −{discountAmount.toFixed(2)} €
    </p>
  </>
)}

<p className="text-4xl font-bold text-blue-600">
  {finalTotal.toFixed(2)} €
</p>
<div className="mt-8 rounded-2xl bg-white p-5 shadow sm:p-8">
  <h2 className="text-xl font-bold sm:text-2xl">
    🎟 Код за отстъпка
  </h2>

  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
    <input
      value={couponCode}
      onChange={(e) =>
        setCouponCode(
          e.target.value.toUpperCase()
        )
      }
      placeholder="Например: WELCOME10"
      className="min-w-0 w-full rounded-lg border p-3 sm:flex-1"
    />

    <button
      type="button"
      onClick={applyCoupon}
      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white sm:w-auto"
    >
      Приложи
    </button>
  </div>
</div>
  {appliedCoupon && (
    <p className="mt-4 font-semibold text-green-600">
      ✔ Активен купон: {appliedCoupon}
    </p>
  )}
</div>
            <button
              type="button"
              onClick={() => setShowCheckoutForm(true)}
              className="rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white"
            >
              Завърши поръчката
            </button>
          </div>
        </div>

        {showCheckoutForm && (
          <form
            onSubmit={submitCheckout}
            className="mt-8 rounded-2xl bg-white p-8 shadow"
          >
            <h2 className="mb-6 text-3xl font-bold">
              Данни за поръчката
            </h2>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Име и фамилия"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Имейл"
              type="email"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Телефон"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Адрес"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Град"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Пощенски код"
              className="mb-4 w-full rounded-lg border p-3"
            />

            <label className="mb-2 block font-semibold">
              Начин на плащане
            </label>

          <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
  className="mb-6 w-full rounded-lg border p-3"
>
  {paymentSettings.cod && (
    <option>Наложен платеж</option>
  )}

  {paymentSettings.stripe && (
    <option>Stripe</option>
  )}

  {paymentSettings.paypal && (
    <option>PayPal</option>
  )}

  {paymentSettings.revolut && (
    <option>Revolut</option>
  )}

  {paymentSettings.bankTransfer && (
    <option>Банков превод</option>
  )}
</select> 

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 py-4 text-white disabled:opacity-50"
              >
                {isSubmitting
                  ? "Изпращане..."
                  : "Изпрати поръчката"}
              </button>

              <button
                type="button"
                onClick={() => setShowCheckoutForm(false)}
                className="rounded-lg bg-gray-300 px-6 py-4"
              >
                Откажи
              </button>
            </div>

            {message && (
              <p className="mt-4 font-semibold">{message}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
