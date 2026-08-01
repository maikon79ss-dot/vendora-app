"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  order_count: number;
  total_spent: number;
};
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    loadCustomers();
  }, []);

 async function loadCustomers() {
  const { data, error } = await supabase
    .from("orders")
.select(
  "id, customer_email, customer_name, customer_phone, checkout_id, total_price, product_name, quantity, created_at, status, courier, address, city, postal_code, tracking_number"
);

  if (error) {
    console.error(error);
    return;
  }

  const customersMap = new Map<
    string,
    Customer & {
      checkouts: Map<string, number>;
    }
  >();

  (data || []).forEach((order) => {
   const email =
  order.customer_email?.trim().toLowerCase() || "без-email";

    if (!customersMap.has(email)) {
      customersMap.set(email, {
        customer_email:
  order.customer_email?.trim().toLowerCase() || "",
        customer_name: order.customer_name || "",
        customer_phone: order.customer_phone || "",
        order_count: 0,
        total_spent: 0,
        checkouts: new Map<string, number>(),
      });
    }

    const customer = customersMap.get(email);

    if (!customer) return;

    const checkoutId =
  order.checkout_id ||
  order.id ||
  `${email}-${order.created_at}-${order.product_name}`;

    if (!customer.checkouts.has(checkoutId)) {
      customer.checkouts.set(
        checkoutId,
        Number(order.total_price) || 0
      );
    }
  });

  const uniqueCustomers: Customer[] = Array.from(
    customersMap.values()
  ).map((customer) => {
    const checkoutTotals = Array.from(customer.checkouts.values());

    return {
      customer_email: customer.customer_email,
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      order_count: customer.checkouts.size,
      total_spent: checkoutTotals.reduce(
        (sum, total) => sum + total,
        0
      ),
    };
  });

  setCustomers(uniqueCustomers);
  setOrders(data || []);
}

  const filteredCustomers = customers.filter((customer) => {

    const text = search.toLowerCase();

    return (
      customer.customer_name?.toLowerCase().includes(text) ||
      customer.customer_email?.toLowerCase().includes(text) ||
      customer.customer_phone?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-10">
      <h1 className="mb-8 text-4xl font-bold">Клиенти</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Общо клиенти</p>

          <h2 className="mt-2 text-3xl font-bold">
            {customers.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Email адреси</p>

          <h2 className="mt-2 text-3xl font-bold">
            {customers.filter((customer) => customer.customer_email).length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Телефони</p>

          <h2 className="mt-2 text-3xl font-bold">
            {customers.filter((customer) => customer.customer_phone).length}
          </h2>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Търси по име, email или телефон..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

  <div className="rounded-xl bg-white p-4 shadow sm:p-6">
  <div className="w-full overflow-x-auto">
    <table className="min-w-[760px] w-full">
      <thead>
        <tr className="border-b">
          <th className="whitespace-nowrap px-3 py-3 text-left">
            Име
          </th>

          <th className="whitespace-nowrap px-3 py-3 text-left">
            Email
          </th>

          <th className="whitespace-nowrap px-3 py-3 text-left">
            Телефон
          </th>

          <th className="whitespace-nowrap px-3 py-3 text-center">
            Поръчки
          </th>

          <th className="whitespace-nowrap px-3 py-3 text-right">
            Общо
          </th>
        </tr>
      </thead>

      <tbody>
        {filteredCustomers.map((customer) => {
          const customerOrders = orders.filter(
            (order) =>
              order.customer_email?.trim().toLowerCase() ===
              customer.customer_email
          );

          const groupedOrders = Object.values(
            customerOrders.reduce((acc: any, order: any) => {
              const key = order.checkout_id || order.id;

              if (!acc[key]) {
                acc[key] = {
                  ...order,
                  products: [],
                };
              }

              acc[key].products.push({
                name: order.product_name,
                quantity: order.quantity,
              });

              return acc;
            }, {})
          );

          return (
            <React.Fragment key={customer.customer_email}>
              <tr
                className="cursor-pointer border-b hover:bg-gray-50"
                onClick={() =>
                  setSelectedCustomer(
                    selectedCustomer === customer.customer_email
                      ? null
                      : customer.customer_email
                  )
                }
              >
                <td className="whitespace-nowrap px-3 py-3 font-medium">
                  {customer.customer_name}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {customer.customer_email}
                </td>

                <td className="whitespace-nowrap px-3 py-3">
                  {customer.customer_phone}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-center">
                  {customer.order_count}
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-right">
                  {(customer.total_spent ?? 0).toFixed(2)} €
                </td>
              </tr>

              {selectedCustomer === customer.customer_email && (
                <tr>
                  <td colSpan={5} className="bg-gray-50 p-4">
                    <div className="space-y-3">
                      {customerOrders.length === 0 ? (
                        <p className="text-gray-500">
                          Няма намерени поръчки.
                        </p>
                      ) : (
                        groupedOrders.map((order: any) => (
                          <div
                            key={order.id}
                            className="rounded-lg border bg-white p-4"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                              <span>
                                <strong>Дата:</strong>{" "}
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </span>

                              <span className="font-semibold">
                                {order.status}
                              </span>
                            </div>

                            <div className="mt-3">
                              <strong>Продукти:</strong>

                              <ul className="mt-2 list-disc pl-5">
                                {order.products.map(
                                  (product: any, index: number) => (
                                    <li key={index}>
                                      {product.name} × {product.quantity}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="mt-3 break-words">
                              <strong>Общо:</strong>{" "}
                              {Number(order.total_price).toFixed(2)} €

                              <div className="mt-2">
                                <strong>Куриер:</strong>{" "}
                                {order.courier || "Не е избран"}
                              </div>

                              <div>
                                <strong>Адрес:</strong>{" "}
                                {order.address}, {order.city},{" "}
                                {order.postal_code}
                              </div>

                              {order.tracking_number && (
                                <div>
                                  <strong>Проследяване:</strong>{" "}
                                  {order.tracking_number}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
    </main>
  );
}