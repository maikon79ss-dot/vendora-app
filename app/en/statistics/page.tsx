"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
};

export default function StatisticsPage() {
  const router = useRouter();

  const [productsCount, setProductsCount] = useState(0);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [paidPaymentsCount, setPaidPaymentsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [shippedOrdersCount, setShippedOrdersCount] = useState(0);
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [lowStockProducts, setLowStockProducts] =
    useState<LowStockProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] =
    useState("free");

  useEffect(() => {
    void loadStatistics();
  }, []);

  async function loadStatistics() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);
      setMessage(
        "Error while checking the user session."
      );
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/en/login");
      return;
    }

    const userId = session.user.id;

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("subscription_plan")
        .eq("id", userId)
        .single();

    if (profileError) {
      console.error(
        "Statistics profile error:",
        profileError
      );
    } else {
      setSubscriptionPlan(
        profile?.subscription_plan || "free"
      );
    }

    const productsResult = await supabase
      .from("products")
      .select("id, name, stock")
      .eq("owner_id", userId);

    if (productsResult.error) {
      console.error(
        "Products statistics error:",
        productsResult.error
      );
    } else {
      const products = productsResult.data || [];

      setProductsCount(products.length);

      const lowStock = products
        .filter((product) => {
          const stock = Number(product.stock || 0);
          return stock >= 0 && stock <= 5;
        })
        .map((product) => ({
          id: String(product.id),
          name: product.name || "Unnamed product",
          stock: Number(product.stock || 0),
        }))
        .sort((a, b) => a.stock - b.stock);

      setLowStockProducts(lowStock);
      setLowStockCount(lowStock.length);
    }

    const paymentsResult = await supabase
      .from("subscription_payments")
      .select("amount, status")
      .eq("user_id", userId);

    if (paymentsResult.error) {
      console.error(
        "Payments statistics error:",
        paymentsResult.error
      );
    } else {
      const payments = paymentsResult.data || [];

      setPaymentsCount(payments.length);

      const paidPayments = payments.filter(
        (payment) =>
          String(payment.status).toLowerCase() === "paid"
      );

      setPaidPaymentsCount(paidPayments.length);

      const revenue = paidPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      setTotalRevenue(revenue);
    }

    const ordersResult = await supabase
      .from("orders")
      .select("status")
      .eq("owner_id", userId);

    if (ordersResult.error) {
      console.error(
        "Orders statistics error:",
        ordersResult.error
      );
    } else {
      const orders = ordersResult.data || [];

      setNewOrdersCount(
        orders.filter(
          (order) =>
            String(order.status).toLowerCase() === "нова"
        ).length
      );

      setShippedOrdersCount(
        orders.filter(
          (order) =>
            String(order.status).toLowerCase() ===
            "изпратена"
        ).length
      );

      setDeliveredOrdersCount(
        orders.filter(
          (order) =>
            String(order.status).toLowerCase() ===
            "доставена"
        ).length
      );
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main
        lang="en"
        className="min-h-screen bg-gray-100 p-10"
      >
        Loading statistics...
      </main>
    );
  }

  const isPremium =
    subscriptionPlan === "premium_monthly" ||
    subscriptionPlan === "premium_yearly";

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-6 md:p-10"
    >
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">
          📊 Statistics
        </h1>

        <p className="mt-3 text-gray-600">
          Data about your products, orders and payments.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-700">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">Products</p>

            <p className="mt-3 text-4xl font-bold">
              {productsCount}
            </p>
          </article>

          {isPremium ? (
            <>
              <article className="rounded-2xl bg-white p-6 shadow">
                <p className="text-gray-500">
                  All payments
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {paymentsCount}
                </p>
              </article>

              <article className="rounded-2xl bg-white p-6 shadow">
                <p className="text-gray-500">
                  Successful payments
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {paidPaymentsCount}
                </p>
              </article>

              <article className="rounded-2xl bg-white p-6 shadow">
                <p className="text-gray-500">
                  Total revenue
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {totalRevenue.toFixed(2)} €
                </p>
              </article>
            </>
          ) : (
            <article className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-6 sm:col-span-2 lg:col-span-3">
              <p className="text-xl font-bold text-blue-700">
                🔒 Advanced statistics
              </p>

              <p className="mt-3 text-gray-600">
                Payment and revenue data are available only with a Premium plan.
              </p>

              <button
                type="button"
                onClick={() => router.push("/en/plan")}
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
              >
                ⭐ View Premium plans
              </button>
            </article>
          )}

          <article className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              New orders
            </p>

            <p className="mt-3 text-4xl font-bold">
              {newOrdersCount}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Shipped orders
            </p>

            <p className="mt-3 text-4xl font-bold">
              {shippedOrdersCount}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Delivered orders
            </p>

            <p className="mt-3 text-4xl font-bold">
              {deliveredOrdersCount}
            </p>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Low stock
            </p>

            <p className="mt-3 text-4xl font-bold">
              {lowStockCount}
            </p>
          </article>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">
            ⚠️ Low-stock products
          </h2>

          <p className="mt-2 text-gray-500">
            Products with 5 or fewer units in stock are shown here.
          </p>

          {lowStockProducts.length === 0 ? (
            <p className="mt-6 rounded-xl bg-green-50 p-4 font-semibold text-green-700">
              There are no low-stock products.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3">
                      Product
                    </th>

                    <th className="px-4 py-3">
                      Stock
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {product.name}
                      </td>

                      <td className="px-4 py-4">
                        {product.stock} units
                      </td>

                      <td className="px-4 py-4">
                        {product.stock === 0 ? (
                          <span className="font-semibold text-red-600">
                            Out of stock
                          </span>
                        ) : (
                          <span className="font-semibold text-orange-600">
                            Low stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
