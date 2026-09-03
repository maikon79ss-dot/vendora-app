"use client";
// Redeploy trigger after Vercel rate limit
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Order = {
  id: number;
  checkout_id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
 postal_code: string;
econt_office_code?: string | null;
quantity: number;
  variant: string;
  payment_method: string;
  total_price: number;
  created_checkout_at: string;
  status: string;
  stock_updated: boolean;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("Всички");
  const [econtWeights, setEcontWeights] =
  useState<Record<string, string>>({});

const [econtPackCounts, setEcontPackCounts] =
  useState<Record<string, string>>({});

const [econtValidating, setEcontValidating] =
  useState<Record<string, boolean>>({});
const groupedOrders: Order[][] = Object.values(
  orders.reduce<Record<string, Order[]>>((groups, order) => {
    const groupKey = order.checkout_id || String(order.id);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(order);

    return groups;
  }, {})
);

const filteredOrders: Order[][] = groupedOrders.filter((orderGroup) => {
  const firstOrder = orderGroup[0];

  if (!firstOrder) return false;

  const search = searchTerm.toLowerCase().trim();

const matchesSearch =
  firstOrder.customer_name?.toLowerCase().includes(search) ||
  firstOrder.customer_email?.toLowerCase().includes(search) ||
  firstOrder.customer_phone?.toLowerCase().includes(search) ||
  firstOrder.city?.toLowerCase().includes(search);

const matchesStatus =
  statusFilter === "Всички" ||
  firstOrder.status === statusFilter;

return matchesSearch && matchesStatus;
});

useEffect(() => {
  loadOrders();
}, []);


  async function loadOrders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setOrders(data || []);
  }
async function sendStatusEmail(
  customerEmail: string,
  customerName: string,
  productName: string,
  newStatus: string
) {
  const response = await fetch("/api/send-order-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: customerEmail,
      subject: "Промяна в статуса на поръчката",
      title: "Статусът на поръчката е променен",
      message: `Здравейте, ${customerName}!

Статусът на вашата поръчка за ${productName} вече е:

${newStatus}

Поздрави,
Vendora`,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Имейлът за статуса не беше изпратен."
    );
  }

  console.log("Имейлът за статуса е изпратен:", result);
}
 async function updateOrderStatus(orderId: number, newStatus: string) {
  const order = orders.find((o) => o.id === orderId);

  if (!order) return;

  if (newStatus === "Изпратена" && !order.stock_updated) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", order.product_id)
      .single();

    if (productError) {
      console.error(productError);
      alert("Грешка при проверка на наличността.");
      return;
    }

    if (product) {
      const newStock = Math.max(
        0,
        Number(product.stock || 0) - Number(order.quantity || 0)
      );

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", order.product_id);

      if (stockError) {
        console.error(stockError);
        alert("Грешка при намаляване на наличността.");
        return;
      }
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        stock_updated: true,
      })
      .eq("id", orderId);

    if (orderError) {
      console.error(orderError);
      alert("Грешка при обновяване на поръчката.");
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === orderId
          ? {
              ...currentOrder,
              status: newStatus,
              stock_updated: true,
            }
          : currentOrder
      )
    );
    await sendStatusEmail(
  order.customer_email,
  order.customer_name,
  order.product_name,
  newStatus
);
  return;
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error(error);
    alert("Грешка при обновяване на статуса.");
    return;
  }

  setOrders((currentOrders) =>
    currentOrders.map((currentOrder) =>
      currentOrder.id === orderId
        ? { ...currentOrder, status: newStatus }
        : currentOrder
    )
  );
  await sendStatusEmail(
  order.customer_email,
  order.customer_name,
  order.product_name,
  newStatus
);
}
 async function copyAddress(order: Order) {
  const address = `${order.address}, ${order.city}, ${order.postal_code}`;

  try {
    await navigator.clipboard.writeText(address);
    alert("✅ Адресът е копиран.");
  } catch {
    alert("❌ Неуспешно копиране.");
  }
}
async function validateEcontShipment(
  orderGroup: Order[]
) {
  const firstOrder = orderGroup[0];

  if (!firstOrder) return;

  const orderKey =
    firstOrder.checkout_id ||
    String(firstOrder.id);

  if (!firstOrder.checkout_id) {
    alert(
      "Липсва номер на поръчката за Econt проверка."
    );
    return;
  }

  if (
    !firstOrder.address?.startsWith(
      "Econt офис:"
    )
  ) {
    alert(
      "Тази поръчка не е за доставка до офис на Econt."
    );
    return;
  }

  if (!firstOrder.econt_office_code) {
    alert(
      "Липсва Econt код на офиса на получателя."
    );
    return;
  }

  const weightText =
    econtWeights[orderKey]?.trim() || "";

  const weight = Number(
    weightText.replace(",", ".")
  );

  const packCount = Number(
    econtPackCounts[orderKey] || "1"
  );

  if (
    !Number.isFinite(weight) ||
    weight <= 0
  ) {
    alert(
      "Въведете валидно тегло на пратката."
    );
    return;
  }

  if (
    !Number.isInteger(packCount) ||
    packCount <= 0
  ) {
    alert(
      "Броят пакети трябва да бъде положително цяло число."
    );
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    alert(
      "Неуспешна проверка на потребителската сесия."
    );
    return;
  }

  setEcontValidating((current) => ({
    ...current,
    [orderKey]: true,
  }));

  try {
    const response = await fetch(
      "/api/econt/validate-shipment",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          checkoutId:
            firstOrder.checkout_id,
          weight,
          packCount,
        }),
      }
    );

    let result: any = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (
      !response.ok ||
      !result?.ok
    ) {
      alert(
        result?.error ||
          "Econt пратката не можа да бъде проверена."
      );
      return;
    }

    const validation =
      result.validation || {};

    const messageLines = [
      "✅ Econt прие данните за пратката.",
      "",
      `Тегло: ${validation.weight ?? weight} кг`,
      `Брой пакети: ${
        validation.packCount ?? packCount
      }`,
      `Econt офис: ${
        validation.receiverOfficeCode ||
        firstOrder.econt_office_code
      }`,
    ];

    if (
      validation.totalPrice !== null &&
      validation.totalPrice !== undefined
    ) {
      messageLines.push(
        `Цена за доставка: ${validation.totalPrice} ${
          validation.currency || ""
        }`
      );
    }

    if (validation.expectedDeliveryDate) {
      messageLines.push(
        `Очаквана доставка: ${validation.expectedDeliveryDate}`
      );
    }

    if (validation.warnings) {
      messageLines.push(
        `Предупреждение: ${
          typeof validation.warnings ===
          "string"
            ? validation.warnings
            : JSON.stringify(
                validation.warnings
              )
        }`
      );
    }

    alert(messageLines.join("\n"));
  } catch (error) {
    console.error(
      "Econt validation error:",
      error
    );

    alert(
      "Възникна грешка при проверката на Econt пратката."
    );
  } finally {
    setEcontValidating((current) => ({
      ...current,
      [orderKey]: false,
    }));
  }
}
function generateOrderPDF(orderGroup: Order[]) {
  const firstOrder = orderGroup[0];

  if (!firstOrder) return;

  const doc = new jsPDF();

  const orderNumber = (
    firstOrder.checkout_id ||
    String(firstOrder.id)
  )
    .slice(0, 8)
    .toUpperCase();

  const groupTotal = orderGroup.reduce(
    (total, order) =>
      total + Number(order.total_price || 0),
    0
  );

  doc.setFontSize(20);
  doc.text("VENDORA", 14, 20);

  doc.setFontSize(16);
  doc.text(`Order #${orderNumber}`, 14, 32);

  doc.setFontSize(11);
  doc.text(
    `Customer: ${firstOrder.customer_name}`,
    14,
    45
  );

  doc.text(
    `Email: ${firstOrder.customer_email}`,
    14,
    52
  );

  doc.text(
    `Phone: ${firstOrder.customer_phone}`,
    14,
    59
  );

  doc.text(
    `Address: ${firstOrder.address}, ${firstOrder.city}, ${firstOrder.postal_code}`,
    14,
    66
  );

  doc.text(
    `Payment: ${firstOrder.payment_method}`,
    14,
    73
  );

  autoTable(doc, {
    startY: 82,

    head: [
      [
        "Product",
        "Variant",
        "Quantity",
        "Price",
      ],
    ],

    body: orderGroup.map((order) => [
      order.product_name,
      order.variant || "Standard",
      String(order.quantity),
      `${Number(
        order.total_price || 0
      ).toFixed(2)} EUR`,
    ]),
  });

  const finalY =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    ).lastAutoTable?.finalY || 100;

  doc.setFontSize(13);

  doc.text(
    `Total: ${groupTotal.toFixed(2)} EUR`,
    14,
    finalY + 12
  );

  doc.save(
    `order-${orderNumber}.pdf`
  );
}

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">Поръчки</h1>
<div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Общо поръчки</p>
    <p className="mt-2 text-3xl font-bold">
      {groupedOrders.length}
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Нови</p>
    <p className="mt-2 text-3xl font-bold">
      {
        groupedOrders.filter(
          (orderGroup) => orderGroup[0]?.status === "Нова"
        ).length
      }
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Изпратени</p>
    <p className="mt-2 text-3xl font-bold">
      {
        groupedOrders.filter(
          (orderGroup) => orderGroup[0]?.status === "Изпратена"
        ).length
      }
    </p>
  </div>

  <div className="rounded-xl bg-white p-5 shadow">
    <p className="text-sm text-gray-500">Общ оборот</p>
    <p className="mt-2 text-3xl font-bold">
      {orders
        .reduce(
          (total, order) =>
            total + Number(order.total_price || 0),
          0
        )
        .toFixed(2)}{" "}
      €
    </p>
  </div>
</div>
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
  <input
    type="text"
    placeholder="🔍 Търси по име, имейл или телефон..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-xl border border-gray-300 px-4 py-3"
  />
</div>
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="rounded-xl border border-gray-300 px-4 py-3 md:w-64"
>
  <option>Всички</option>
  <option>Нова</option>
  <option>Обработва се</option>
  <option>Изпратена</option>
  <option>Доставена</option>
  <option>Отказана</option>
</select>
      {orders.length === 0 && (

        <p className="text-gray-600">Все още няма поръчки.</p>
      )}

      <div className="grid gap-8">
  {filteredOrders.map((orderGroup) => {
    const firstOrder = orderGroup[0];

    const groupTotal = orderGroup.reduce(
      (total, order) => total + Number(order.total_price || 0),
      0
    );

    const totalQuantity = orderGroup.reduce(
      (total, order) => total + order.quantity,
      0
    );
const orderKey =
  firstOrder.checkout_id ||
  String(firstOrder.id);
    return (
      <div
        key={firstOrder.checkout_id || String(firstOrder.id)}
        className="rounded-2xl bg-white p-6 shadow"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
  <h2 className="text-2xl font-bold">
  📦 Поръчка #
  {(firstOrder.checkout_id || String(firstOrder.id))
    .slice(0, 8)
    .toUpperCase()}
</h2>

<div className="mt-4">
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      firstOrder.status === "Нова"
        ? "bg-yellow-100 text-yellow-800"
        : firstOrder.status === "Обработва се"
        ? "bg-blue-100 text-blue-800"
        : firstOrder.status === "Изпратена"
        ? "bg-purple-100 text-purple-800"
        : firstOrder.status === "Доставена"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {firstOrder.status}
  </span>
</div>

            <p className="mt-3">👤 {firstOrder.customer_name}</p>
            <p>📧 {firstOrder.customer_email}</p>
            <p>📞 {firstOrder.customer_phone}</p>

            <div className="mt-3">
  <p>
    📍 {firstOrder.address}, {firstOrder.city}, {firstOrder.postal_code}
  </p>

  <button
    type="button"
    onClick={() => copyAddress(firstOrder)}
    className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
  >
    📋 Копирай адрес
  </button>
 {firstOrder.address?.startsWith(
  "Econt офис:"
) && (
  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="font-bold text-green-800">
      📦 Econt проверка на пратката
    </p>

    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-semibold">
        Тегло (кг)

        <input
          type="text"
          inputMode="decimal"
          value={
            econtWeights[orderKey] || ""
          }
          onChange={(e) =>
            setEcontWeights(
              (current) => ({
                ...current,
                [orderKey]:
                  e.target.value,
              })
            )
          }
          placeholder="Напр. 1.5"
          className="mt-1 w-full rounded-lg border bg-white p-2"
        />
      </label>

      <label className="text-sm font-semibold">
        Брой пакети

        <input
          type="number"
          min="1"
          step="1"
          value={
            econtPackCounts[
              orderKey
            ] || "1"
          }
          onChange={(e) =>
            setEcontPackCounts(
              (current) => ({
                ...current,
                [orderKey]:
                  e.target.value,
              })
            )
          }
          className="mt-1 w-full rounded-lg border bg-white p-2"
        />
      </label>
    </div>

    <button
      type="button"
      onClick={() =>
        void validateEcontShipment(
          orderGroup
        )
      }
      disabled={
        econtValidating[orderKey] ===
        true
      }
      className="mt-3 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
    >
      {econtValidating[orderKey]
        ? "Проверяване..."
        : "📦 Провери пратката"}
    </button>

    <p className="mt-2 text-xs text-green-800">
      Тази проверка не създава
      товарителница.
    </p>
  </div>
)}          
</div>

            <p className="mt-3 text-sm text-gray-500">
              📅{" "}
              {new Date(
                firstOrder.created_checkout_at || firstOrder.created_at
              ).toLocaleString("bg-BG")}
            </p>
          </div>

          <div className="rounded-xl bg-gray-100 px-5 py-4 text-right">
            <p className="text-sm text-gray-600">Обща сума</p>
            <p className="text-3xl font-bold text-blue-600">
              {groupTotal.toFixed(2)} €
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Общо бройки: {totalQuantity}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Продукт</th>
                <th className="py-3">Вариант</th>
                <th className="py-3">Количество</th>
                <th className="py-3">Сума</th>
              </tr>
            </thead>

            <tbody>
              {orderGroup.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 font-semibold">
                    {order.product_name}
                  </td>

                  <td className="py-3">
                    {order.variant || "Стандартен"}
                  </td>

                  <td className="py-3">
                    {order.quantity}
                  </td>

                  <td className="py-3">
                    {Number(order.total_price || 0).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
<div className="mt-6 flex flex-wrap gap-3">
  <button
    type="button"
    onClick={() => void generateOrderPDF(orderGroup)}
    className="rounded-lg bg-gray-800 px-5 py-3 text-white hover:bg-gray-900"
  >
    📄 Изтегли поръчката като PDF
  </button>
</div>

        <div className="mt-6">
          <label className="mb-2 block font-semibold">
            Статус на поръчката
          </label>

          <select
            value={firstOrder.status}
            onChange={async (e) => {
              const newStatus = e.target.value;

              for (const order of orderGroup) {
                await updateOrderStatus(order.id, newStatus);
              }
            }}
            className="w-full rounded-lg border p-3"
          >
            <option>Нова</option>
            <option>Обработва се</option>
            <option>Изпратена</option>
            <option>Доставена</option>
            <option>Отказана</option>
          </select>
        </div>
      </div>
      );
  })}
</div>
    </main>
  );
}
