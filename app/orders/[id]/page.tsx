"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: number;
  checkout_id?: string | null;
  product_name: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  quantity: number;
  variant?: string | null;
  total_price?: number | null;
  payment_method?: string | null;
  status: string;
    courier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  delivery_days?: number | null;
  expected_delivery?: string | null;
  created_at?: string | null;
  created_checkout_at?: string | null;

};

const statuses = [
  "Нова",
  "Приета",
  "Подготвя се",
  "Изпратена",
  "Доставена",
  "Отказана",
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
const [courier, setCourier] = useState("");
const [trackingNumber, setTrackingNumber] = useState("");
const [trackingUrl, setTrackingUrl] = useState("");
const [deliveryDays, setDeliveryDays] = useState(3);
const [expectedDelivery, setExpectedDelivery] = useState("");
  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  async function loadOrder() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);
      setMessage("Грешка при проверка на сесията.");
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
       .select(
        `
        id,
        checkout_id,
        product_name,
        customer_name,
        customer_email,
        customer_phone,
        address,
        city,
        postal_code,
        quantity,
        variant,
        total_price,
        payment_method,
        status,
        courier,
        tracking_number,
        tracking_url,
        delivery_days,
        expected_delivery,
        created_at,
        created_checkout_at
        `
      )
      .eq("id", orderId)
      .eq("owner_id", session.user.id)
      .single();

    if (error) {
      console.error(error);
      setMessage("Поръчката не беше намерена.");
      setLoading(false);
      return;
    }

    setOrder(data);
    setStatus(data.status || "Нова");
    setCourier(data.courier || "");
setTrackingNumber(data.tracking_number || "");
setTrackingUrl(data.tracking_url || "");
setDeliveryDays(data.delivery_days || 3);
setExpectedDelivery(data.expected_delivery || "");
    setLoading(false);
  }

  async function saveStatus() {
    if (!order) {
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", order.id)
      .eq("owner_id", session.user.id);

    if (error) {
      console.error(error);
      setMessage("Грешка при запазване на статуса.");
      setSaving(false);
      return;
    }

    setOrder({
      ...order,
      status,
    });

    setMessage("Статусът е запазен успешно.");
    setSaving(false);
  }
  async function saveShipment() {
    if (!order) {
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const calculatedDate = new Date();
    calculatedDate.setDate(
      calculatedDate.getDate() + Number(deliveryDays)
    );

    const calculatedExpectedDelivery =
      calculatedDate.toISOString().split("T")[0];
let generatedTrackingUrl = trackingUrl;

if (!generatedTrackingUrl && trackingNumber) {
  switch (courier) {
    case "Speedy":
      generatedTrackingUrl =
        `https://www.speedy.bg/bg/track?shipment=${trackingNumber}`;
      break;

    case "Econt":
      generatedTrackingUrl =
        `https://www.econt.com/services/track-shipment/${trackingNumber}`;
      break;

    case "DHL":
      generatedTrackingUrl =
        `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${trackingNumber}`;
      break;

    case "UPS":
      generatedTrackingUrl =
        `https://www.ups.com/track?tracknum=${trackingNumber}`;
      break;

    case "FedEx":
      generatedTrackingUrl =
        `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
      break;
  }
}
const nextStatus =
  courier && trackingNumber
    ? "Изпратена"
    : status;
    const { error } = await supabase
      .from("orders")
    .update({
  courier,
  tracking_number: trackingNumber,
  tracking_url: generatedTrackingUrl,
  delivery_days: Number(deliveryDays),
  expected_delivery: calculatedExpectedDelivery,
  status: nextStatus,
})
      .eq("id", order.id)
      .eq("owner_id", session.user.id);

    if (error) {
      console.error(error);
      setMessage("Грешка при запазване на доставката.");
      setSaving(false);
      return;
    }
    setExpectedDelivery(calculatedExpectedDelivery);
setTrackingUrl(generatedTrackingUrl);
setStatus(nextStatus);
    setOrder({
      ...order,
      courier,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      delivery_days: Number(deliveryDays),
      expected_delivery: calculatedExpectedDelivery,
      status: nextStatus,
    });

    setMessage("Данните за доставката са запазени успешно.");
    setSaving(false);
  }
  function formatDate() {
    if (!order) {
      return "Няма дата";
    }

    const value =
      order.created_checkout_at ||
      order.created_at;

    if (!value) {
      return "Няма дата";
    }

    return new Intl.DateTimeFormat("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        Зареждане на поръчката...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
          <p className="font-semibold text-red-600">
            {message || "Поръчката не беше намерена."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            ← Назад към поръчките
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="rounded-lg border bg-white px-4 py-2 font-semibold"
        >
          ← Назад към поръчките
        </button>

        <div className="mt-6 rounded-2xl bg-white p-8 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                📦 Поръчка #{order.id}
              </h1>

              <p className="mt-3 text-gray-500">
                {formatDate()}
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">
              {order.status}
            </span>
          </div>

          {message && (
            <p className="mt-6 rounded-xl bg-blue-50 p-4 font-semibold text-blue-700">
              {message}
            </p>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-bold">
                👤 Данни за клиента
              </h2>

              <div className="mt-5 space-y-4">
                <p>
                  <span className="font-semibold">Име:</span>{" "}
                  {order.customer_name}
                </p>

                <p>
                  <span className="font-semibold">Имейл:</span>{" "}
                  {order.customer_email || "Няма"}
                </p>

                <p>
                  <span className="font-semibold">Телефон:</span>{" "}
                  {order.customer_phone || "Няма"}
                </p>

                <p>
                  <span className="font-semibold">Адрес:</span>{" "}
                  {order.address || "Няма"}
                </p>

                <p>
                  <span className="font-semibold">Град:</span>{" "}
                  {order.city || "Няма"}
                </p>

                <p>
                  <span className="font-semibold">
                    Пощенски код:
                  </span>{" "}
                  {order.postal_code || "Няма"}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-bold">
                🛒 Данни за поръчката
              </h2>

              <div className="mt-5 space-y-4">
                <p>
                  <span className="font-semibold">Продукт:</span>{" "}
                  {order.product_name}
                </p>

                <p>
                  <span className="font-semibold">Количество:</span>{" "}
                  {order.quantity}
                </p>

                <p>
                  <span className="font-semibold">Вариант:</span>{" "}
                  {order.variant || "Стандартен"}
                </p>

                <p>
                  <span className="font-semibold">Сума:</span>{" "}
                  {Number(order.total_price || 0).toFixed(2)} €
                </p>

                <p>
                  <span className="font-semibold">
                    Метод на плащане:
                  </span>{" "}
                  {order.payment_method || "Няма"}
                </p>

                <p>
                  <span className="font-semibold">
                    Checkout номер:
                  </span>{" "}
                  {order.checkout_id || "Няма"}
                </p>
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border p-6">
            <h2 className="text-2xl font-bold">
              🔄 Промяна на статуса
            </h2>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="mt-5 w-full rounded-xl border p-4"
            >
              {statuses.map((statusOption) => (
                <option
                  key={statusOption}
                  value={statusOption}
                >
                  {statusOption}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={saveStatus}
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white disabled:bg-gray-400"
            >
              {saving
                ? "Запазване..."
                : "💾 Запази статуса"}
            </button>
          </section>
                    <section className="mt-8 rounded-2xl border p-6">
            <h2 className="text-2xl font-bold">
              🚚 Доставка
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="font-semibold">
                  Куриер
                </label>

                <select
                  value={courier}
                  onChange={(event) =>
                    setCourier(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border p-4"
                >
                  <option value="">
                    Избери куриер
                  </option>
                  <option value="Speedy">
                    Speedy
                  </option>
                  <option value="Econt">
                    Econt
                  </option>
                  <option value="DHL">
                    DHL
                  </option>
                  <option value="UPS">
                    UPS
                  </option>
                  <option value="FedEx">
                    FedEx
                  </option>
                  <option value="Друг">
                    Друг
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold">
                  Номер за проследяване
                </label>

                <input
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(event.target.value)
                  }
                  placeholder="Например: SP123456789"
                  className="mt-2 w-full rounded-xl border p-4"
                />
              </div>

              <div>
                <label className="font-semibold">
                  Срок за доставка
                </label>

                <select
                  value={deliveryDays}
                  onChange={(event) =>
                    setDeliveryDays(
                      Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border p-4"
                >
                  <option value={1}>1 ден</option>
                  <option value={2}>2 дни</option>
                  <option value={3}>3 дни</option>
                  <option value={5}>5 дни</option>
                  <option value={7}>7 дни</option>
                  <option value={10}>10 дни</option>
                  <option value={14}>14 дни</option>
                  <option value={20}>20 дни</option>
                  <option value={30}>30 дни</option>
                </select>
              </div>

              <div>
                <label className="font-semibold">
                  Линк за проследяване
                </label>

                <input
  
                  value={trackingUrl}
                  onChange={(event) =>
                    setTrackingUrl(event.target.value)
                  }
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border p-4"
                />
              </div>
{trackingUrl && (
  <a
    href={trackingUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
  >
    🔗 Отвори проследяването
  </a>
)}
              {expectedDelivery && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="font-semibold text-blue-700">
                    Очаквана доставка
                  </p>

                  <p className="mt-2 text-lg">
                    {new Intl.DateTimeFormat(
                      "bg-BG"
                    ).format(
                      new Date(expectedDelivery)
                    )}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={saveShipment}
                disabled={saving}
                className="rounded-xl bg-green-600 py-4 font-semibold text-white disabled:bg-gray-400"
              >
                {saving
                  ? "Запазване..."
                  : "💾 Запази доставката"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}