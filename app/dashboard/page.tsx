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
      router.push("/login");
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
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Зареждане...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-red-600">
          Профилът не беше намерен.
        </p>
      </main>
    );
  }

  const storeUrl = `/store/${profile.store_slug}`;

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="relative min-h-screen lg:flex">
        <div className="flex items-center justify-between border-b bg-white p-4 lg:hidden">
 <h1 className="mb-8 hidden text-2xl font-bold lg:block">
  Вендора
</h1>

  <button
    type="button"
    onClick={() =>
      setMobileMenuOpen(true)
    }
    className="rounded-lg border px-4 py-2 text-2xl"
    aria-label="Отвори менюто"
  >
    ☰
  </button>
</div>
        <aside
  className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
    mobileMenuOpen
      ? "translate-x-0"
      : "-translate-x-full"
  }`}
>
  <div className="mb-6 flex items-center justify-between lg:hidden">
  <span className="text-2xl font-bold">
    Вендора
  </span>

  <button
    type="button"
    onClick={() => setMobileMenuOpen(false)}
    className="rounded-lg border px-3 py-2 text-xl"
    aria-label="Затвори менюто"
  >
    ✕
  </button>
</div>
          <h1 className="mb-8 text-2xl font-bold">Вендора</h1>

          <nav className="space-y-4">
            <p>
              <Link href="/dashboard">🏠 Dashboard</Link>
            </p>

            <p>
              <Link href="/products">📦 Products</Link>
            </p>

            <p>
              <Link href="/dashboard/orders">🛒 Orders</Link>
            </p>
<p>
  <Link href="/dashboard/customers">👥 Customers</Link>
</p>

<p>
  <Link href="/dashboard/coupons">🎟 Купони</Link>
</p>

<p>
  <Link href="/payments">💳 Payments</Link>
</p>
            <p>
              <Link href="/statistics">📈 Statistics</Link>
            </p>

            <p>
              <Link href="/notifications">🔔 Notifications</Link>
            </p>

            <p>
              <Link href="/plan">⭐ Plan</Link>
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
    aria-label="Затвори менюто"
    onClick={() => setMobileMenuOpen(false)}
    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
  />
)}
        <section className="w-full min-w-0 p-4 sm:p-6 lg:flex-1 lg:p-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Здравей, {profile.first_name}!
          </h2>

          <p className="mt-2 text-lg text-gray-500">
            Вашата страница на Vendora е готова.
          </p>
<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">📦 Продукти</h3>

    <p className="mt-3 text-4xl font-bold">{productCount}</p>

    <p className="mt-2 text-gray-600">Активни продукти</p>
  </div>

  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">🛒 Поръчки</h3>

    <p className="mt-3 text-4xl font-bold">{orderCount}</p>

    <p className="mt-2 text-gray-600">Общо получени поръчки</p>
  </div>

  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">💰 Приходи</h3>

    <p className="mt-3 text-4xl font-bold">{totalRevenue.toFixed(2)} €</p>

    <p className="mt-2 text-gray-600">Общо приходи</p>
  </div>

  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">👥 Клиенти</h3>

    <p className="mt-3 text-4xl font-bold">{customerCount}</p>

    <p className="mt-2 text-gray-600">Общо клиенти</p>
  </div>
</div>

<div className="mt-8">
  <Card>
    <h3 className="text-xl font-bold">Вашият магазин</h3>

    <p className="mt-3 text-gray-600">{profile.store_name}</p>

    <p className="mt-2 break-all font-semibold">{storeUrl}</p>

    <Link
      href={storeUrl}
      target="_blank"
      className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
    >
      🌍 Отвори магазина
    </Link>
  </Card>
</div>

<div className="mt-8 grid gap-6 lg:grid-cols-2">
  <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h3 className="text-xl font-bold">⭐ План</h3>

    <div className="mt-3">
      <Badge variant="success">
  {profile.subscription_plan === "premium_monthly"
    ? "Premium Monthly"
    : profile.subscription_plan === "premium_yearly"
    ? "Premium Yearly"
    : "Free"}
</Badge>
    </div>

    <p className="mt-2 text-gray-600">Текущ абонамент</p>
  </div>

  <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold sm:text-xl">
        🛒 Последни поръчки
      </h3>

      <Link
        href="/dashboard/orders"
        className="text-sm font-semibold text-blue-600 hover:underline"
      >
        Виж всички
      </Link>
    </div>

    <div className="mt-4 space-y-3">
      {recentOrders.length === 0 ? (
        <p className="text-gray-500">Все още няма поръчки.</p>
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
  {order.status}
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
    📈 Продажби
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

          <YAxis
            width={45}
            tick={{ fontSize: 12 }}
          />

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