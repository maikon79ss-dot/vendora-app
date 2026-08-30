"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  total_price?: number | null;
  payment_method?: string | null;
    status: string;
  courier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  expected_delivery?: string | null;
  created_at?: string | null;
  created_checkout_at?: string | null;
};

const statusFilters = [
  "Всички",
  "Нова",
  "Приета",
  "Подготвя се",
  "Изпратена",
  "Доставена",
  "Отказана",
];

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("Всички");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
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
        total_price,
              payment_method,
        status,
        courier,
        tracking_number,
        tracking_url,
        expected_delivery,
        created_at,
        created_checkout_at
        `
      )
      .eq("owner_id", session.user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Грешка при зареждане на поръчките.");
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  function getStatusCount(status: string) {
    if (status === "Всички") {
      return orders.length;
    }

    return orders.filter(
      (order) =>
        order.status.toLowerCase() === status.toLowerCase()
    ).length;
  }

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        activeStatus === "Всички" ||
        order.status.toLowerCase() ===
          activeStatus.toLowerCase();

      const searchableText = [
        order.id,
        order.checkout_id,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.product_name,
        order.payment_method,
        order.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, activeStatus]);

  function formatDate(order: Order) {
    const value =
      order.created_checkout_at || order.created_at;

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

  function getStatusClass(status: string) {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "нова") {
      return "bg-yellow-100 text-yellow-800";
    }

    if (normalizedStatus === "приета") {
      return "bg-green-100 text-green-800";
    }

    if (normalizedStatus === "подготвя се") {
      return "bg-orange-100 text-orange-800";
    }

    if (normalizedStatus === "изпратена") {
      return "bg-blue-100 text-blue-800";
    }

    if (normalizedStatus === "доставена") {
      return "bg-emerald-100 text-emerald-800";
    }

    if (normalizedStatus === "отказана") {
      return "bg-red-100 text-red-800";
    }

    return "bg-gray-100 text-gray-700";
  }

  function getStatusIcon(status: string) {
    if (status === "Нова") return "🟡";
    if (status === "Приета") return "🟢";
    if (status === "Подготвя се") return "📦";
    if (status === "Изпратена") return "🚚";
    if (status === "Доставена") return "✅";
    if (status === "Отказана") return "❌";

    return "📋";
  }

  function getPaymentLabel(paymentMethod?: string | null) {
    const method = paymentMethod?.toLowerCase() || "";

    if (method.includes("наложен")) {
      return {
        text: "Наложен платеж",
        className: "bg-yellow-100 text-yellow-800",
      };
    }

    if (
      method.includes("stripe") ||
      method.includes("карта") ||
      method.includes("card")
    ) {
      return {
        text: "Плащане с карта",
        className: "bg-green-100 text-green-800",
      };
    }

    if (method.includes("paypal")) {
      return {
        text: "PayPal",
        className: "bg-blue-100 text-blue-800",
      };
    }

    return {
      text: paymentMethod || "Не е посочено",
      className: "bg-gray-100 text-gray-700",
    };
  }
function checkEcontShipment(order: Order) {
  const isEcontOrder =
    order.address?.startsWith("Econt офис:");

  if (!isEcontOrder) {
    alert("Тази поръчка не е за доставка до офис на Econt.");
    return;
  }

  if (
    !order.customer_name ||
    !order.customer_phone ||
    !order.city ||
    !order.address
  ) {
    alert(
      "Липсват данни, необходими за създаване на Econt пратка."
    );
    return;
  }

  alert(
    `✅ Поръчката е готова за Econt.

Клиент: ${order.customer_name}
Телефон: ${order.customer_phone}
Град: ${order.city}
Доставка: ${order.address}
Пощенски код: ${order.postal_code || "-"}`
  );
}
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        Зареждане на поръчките...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              📦 Order Center
            </h1>

            <p className="mt-3 text-gray-600">
              Управлявайте всички поръчки на магазина.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm"
          >
            🔄 Обнови
          </button>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">
            {message}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {statusFilters.map((status) => {
            const selected = activeStatus === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`rounded-2xl p-5 text-left shadow transition ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:-translate-y-1"
                }`}
              >
                <p className="font-semibold">
                  {getStatusIcon(status)} {status}
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {getStatusCount(status)}
                </p>
              </button>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Търси по клиент, телефон, продукт или номер..."
              className="w-full rounded-xl border p-4"
            />

            {(search || activeStatus !== "Всички") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveStatus("Всички");
                }}
                className="rounded-xl border px-5 py-4 font-semibold"
              >
                Изчисти
              </button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Показани поръчки: {filteredOrders.length}
          </p>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow">
          {filteredOrders.length === 0 ? (
            <p className="rounded-xl bg-gray-100 p-5 text-gray-600">
              Няма намерени поръчки.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3">№</th>
                    <th className="px-4 py-3">Клиент</th>
                    <th className="px-4 py-3">Продукт</th>
                    <th className="px-4 py-3">Количество</th>
                    <th className="px-4 py-3">Сума</th>
                    <th className="px-4 py-3">Плащане</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Дата</th>
                    <th className="px-4 py-3">Проследяване</th>
                    <th className="px-4 py-3">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const payment = getPaymentLabel(
                      order.payment_method
                    );

                    return (
                      <tr
                        key={order.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4 font-semibold">
                          #{order.id}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {order.customer_name}
                          </p>

                          {order.customer_phone && (
                            <p className="mt-1 text-sm text-gray-500">
                              {order.customer_phone}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {order.product_name}
                        </td>

                        <td className="px-4 py-4">
                          {order.quantity}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {Number(
                            order.total_price || 0
                          ).toFixed(2)}{" "}
                          €
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-2 text-sm font-semibold ${payment.className}`}
                          >
                            {payment.text}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-2 text-sm font-semibold ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}{" "}
                            {order.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(order)}
                        </td>

                        <td className="px-4 py-4">
  {order.courier ? (
    <div className="space-y-1">
      <p className="font-semibold">
        🚚 {order.courier}
      </p>

      {order.tracking_url ? (
        <a
          href={order.tracking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          {order.tracking_number || "Проследяване"}
        </a>
      ) : (
        <p className="text-sm text-gray-500">
          {order.tracking_number || "Без номер"}
        </p>
      )}

      {order.expected_delivery && (
        <p className="text-xs text-gray-500">
          📅{" "}
          {new Intl.DateTimeFormat("bg-BG").format(
            new Date(order.expected_delivery)
          )}
        </p>
      )}
    </div>
  ) : (
    <span className="text-gray-400">
      —
    </span>
  )}
</td>

                     <td className="px-4 py-4">
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() =>
        router.push(
          `/orders/${order.id}`
        )
      }
      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
    >
      👁 Отвори
    </button>

    {order.address?.startsWith("Econt офис:") && (
      <button
        type="button"
        onClick={() => checkEcontShipment(order)}
        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
      >
        📦 Econt
      </button>
    )}

    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border px-4 py-2 font-semibold"
    >
      🖨
    </button>
  </div>
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
