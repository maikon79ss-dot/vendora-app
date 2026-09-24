"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/products/components/ui/Card";
import Button from "@/app/products/components/ui/Button";
import Badge from "@/app/products/components/ui/Badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Profile = {
  first_name: string;
  store_name: string;
  store_slug: string;
  subscription_plan: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<
    { date: string; revenue: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/en/login");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, store_name, store_slug, subscription_plan")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error(profileError);
    } else {
      setProfile(profileData);
    }

    const { count, error: productError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", session.user.id);

    const { count: orderCountData, error: orderError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", session.user.id);

    const { data: deliveredOrders, error: revenueError } = await supabase
      .from("orders")
      .select("total_price, created_at")
      .eq("owner_id", session.user.id)
      .eq("status", "Доставена");

    if (revenueError) {
      console.error(revenueError);
    } else {
      const revenue =
        deliveredOrders?.reduce(
          (sum, order) => sum + Number(order.total_price || 0),
          0
        ) ?? 0;

      setTotalRevenue(revenue);

      const revenueByDate: Record<string, number> = {};

      deliveredOrders?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString("bg-BG");

        revenueByDate[date] =
          (revenueByDate[date] || 0) + Number(order.total_price || 0);
      });

      const formattedSalesData = Object.entries(revenueByDate)
        .map(([date, revenue]) => ({
          date,
          revenue,
          sortDate: new Date(date.split(".").reverse().join("-")),
        }))
        .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
        .map(({ date, revenue }) => ({
          date,
          revenue,
        }));

      setSalesData(formattedSalesData);
    }

    const { data: customerOrders, error: customerError } = await supabase
      .from("orders")
      .select("customer_email")
      .eq("owner_id", session.user.id);

    if (customerError) {
      console.error(customerError);
    } else {
      const uniqueCustomers = new Set(
        customerOrders
          ?.map((order) => order.customer_email?.toLowerCase().trim())
          .filter(Boolean)
      );

      setCustomerCount(uniqueCustomers.size);
    }

    if (orderError) {
      console.error(orderError);
    } else {
      setOrderCount(orderCountData ?? 0);
    }

    const { data: recentOrdersData, error: recentOrdersError } = await supabase
      .from("orders")
      .select("customer_name, total_price, status")
      .eq("owner_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.error(recentOrdersError);
    } else {
      setRecentOrders(recentOrdersData ?? []);
    }

    if (productError) {
      console.error(productError);
    } else {
      setProductCount(count ?? 0);
    }

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/en/login");
  }

  if (loading) {
    return (
      <main
        lang="en"
        className="flex min-h-screen items-center justify-center bg-gray-100"
      >
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main
        lang="en"
        className="flex min-h-screen items-center justify-center bg-gray-100"
      >
        <p className="text-lg font-semibold text-red-600">
          Profile not found.
        </p>
      </main>
    );
  }

  const storeUrl = `/en/store/${profile.store_slug}`;

  return (
    <main lang="en" className="min-h-screen bg-gray-100">
      <div className="relative min-h-screen lg:flex">
        <div className="flex items-center justify-between border-b bg-white p-4 lg:hidden">
          <h1 className="text-2xl font-bold">Vendora</h1>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg border px-4 py-2 text-2xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="text-2xl font-bold">Vendora</span>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg border px-3 py-2 text-xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <h1 className="mb-8 hidden text-2xl font-bold lg:block">
            Vendora
          </h1>

          <nav className="space-y-4">
            <p>
              <Link href="/en/dashboard">🏠 Dashboard</Link>
            </p>

            <p>
              <Link href="/en/products">📦 Products</Link>
            </p>

            <p>
              <Link href="/en/dashboard/orders">🛒 Orders</Link>
            </p>

            <p>
              <Link href="/en/dashboard/customers">👥 Customers</Link>
            </p>

            <p>
              <Link href="/en/dashboard/coupons">🎟 Coupons</Link>
            </p>

            <p>
              <Link href="/en/payments">💳 Payments</Link>
            </p>

            <p>
              <Link href="/en/statistics">📈 Statistics</Link>
            </p>

            <p>
              <Link href="/notifications">🔔 Notifications</Link>
            </p>

            <p>
              <Link href="/en/plan">⭐ Plan</Link>
            </p>

            <p>
              <Link href="/settings">⚙ Settings</Link>
            </p>

            <Button
              onClick={handleLogout}
              className="mt-4 w-full bg-red-600 hover:bg-red-700"
            >
              🚪 Logout
            </Button>
          </nav>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        <section className="w-full min-w-0 p-4 sm:p-6 lg:flex-1 lg:p-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Hello, {profile.first_name}!
          </h2>

          <p className="mt-2 text-lg text-gray-500">
            Your Vendora store is ready.
          </p>

          <Link
            href={storeUrl}
            target="_blank"
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
          >
            🌍 OPEN STORE
          </Link>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">📦 Products</h3>

              <p className="mt-3 text-4xl font-bold">{productCount}</p>

              <p className="mt-2 text-gray-600">Active products</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">🛒 Orders</h3>

              <p className="mt-3 text-4xl font-bold">{orderCount}</p>

              <p className="mt-2 text-gray-600">Total orders received</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">💰 Revenue</h3>

              <p className="mt-3 text-4xl font-bold">
                {totalRevenue.toFixed(2)} €
              </p>

              <p className="mt-2 text-gray-600">Total revenue</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">👥 Customers</h3>

              <p className="mt-3 text-4xl font-bold">{customerCount}</p>

              <p className="mt-2 text-gray-600">Total customers</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">⭐ Plan</h3>

              <div className="mt-3">
                <Badge variant="success">
                  {profile.subscription_plan === "premium_monthly"
                    ? "Premium Monthly"
                    : profile.subscription_plan === "premium_yearly"
                    ? "Premium Yearly"
                    : "Free"}
                </Badge>
              </div>

              <p className="mt-2 text-gray-600">Current subscription</p>
            </div>

            <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold sm:text-xl">
                  🛒 Recent orders
                </h3>

                <Link
                  href="/en/dashboard/orders"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500">There are no orders yet.</p>
                ) : (
                  recentOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-semibold">{order.customer_name}</p>

                        <Badge
                          variant={
                            order.status === "Доставена"
                              ? "success"
                              : order.status === "Изпратена"
                              ? "info"
                              : order.status === "Обработва се"
                              ? "warning"
                              : order.status === "Отказана"
                              ? "danger"
                              : "default"
                          }
                        >
                          {order.status === "Нова"
  ? "New"
  : order.status === "Очаква плащане"
  ? "Awaiting payment"
  : order.status === "Обработва се"
                            ? "Processing"
                            : order.status === "Изпратена"
                            ? "Shipped"
                            : order.status === "Доставена"
                            ? "Delivered"
                            : order.status === "Отказана"
                            ? "Cancelled"
                            : order.status}
                        </Badge>
                      </div>

                      <span className="font-bold">
                        €{Number(order.total_price).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-6 text-xl font-bold sm:text-2xl">
              📈 Sales
            </h2>

            <div className="w-full overflow-x-auto">
              <div className="h-[300px] min-w-[560px] sm:h-[350px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      minTickGap={20}
                    />

                    <YAxis width={45} tick={{ fontSize: 12 }} />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
