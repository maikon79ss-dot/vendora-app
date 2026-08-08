"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
type TemplateType =
  | "new_order"
  | "shipped"
  | "delivered"
  | "cancelled";

type NotificationTemplate = {
  id?: number;
  user_id: string;
  type: TemplateType;
  subject: string;
  body: string;
};
export default function NotificationsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");

  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyShippedOrder, setNotifyShippedOrder] = useState(true);
  const [notifyDeliveredOrder, setNotifyDeliveredOrder] = useState(true);
  const [notifyCancelledOrder, setNotifyCancelledOrder] = useState(true);
  const [notifyAdminCopy, setNotifyAdminCopy] = useState(false);
const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
const [activeTemplate, setActiveTemplate] =
  useState<TemplateType>("new_order");

const [templateSubject, setTemplateSubject] = useState("");
const [templateBody, setTemplateBody] = useState("");
const [templateLoading, setTemplateLoading] = useState(false);
const [templateSaving, setTemplateSaving] = useState(false);
const [showPreview, setShowPreview] = useState(false);
const defaultTemplates: Record<
  TemplateType,
  { subject: string; body: string }
> = {
  new_order: {
    subject: "Получихме Вашата поръчка #{ORDER_ID}",
    body: `Здравейте {CUSTOMER_NAME},

Получихме Вашата поръчка #{ORDER_ID}.

Продукт: {PRODUCT_NAME}

Благодарим Ви,
{STORE_NAME}`,
  },

  shipped: {
    subject: "Вашата поръчка #{ORDER_ID} е изпратена",
    body: `Здравейте {CUSTOMER_NAME},

Вашата поръчка #{ORDER_ID} е изпратена.

Куриер: {COURIER}
Номер за проследяване: {TRACKING_NUMBER}
Очаквана доставка: {EXPECTED_DELIVERY}

Благодарим Ви,
{STORE_NAME}`,
  },

  delivered: {
    subject: "Вашата поръчка #{ORDER_ID} е доставена",
    body: `Здравейте {CUSTOMER_NAME},

Вашата поръчка #{ORDER_ID} е доставена успешно.

Благодарим Ви, че пазарувахте от {STORE_NAME}.`,
  },

  cancelled: {
    subject: "Вашата поръчка #{ORDER_ID} е отказана",
    body: `Здравейте {CUSTOMER_NAME},

Вашата поръчка #{ORDER_ID} беше отказана.

При въпроси се свържете с {STORE_NAME}.`,
  },
};
  useEffect(() => {
    void loadNotificationSettings();
  }, []);
useEffect(() => {
  if (userId) {
    void loadTemplate(activeTemplate);
  }
}, [userId, activeTemplate]);
  async function loadNotificationSettings() {
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

    setUserId(session.user.id);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        notify_new_order,
        notify_shipped_order,
        notify_delivered_order,
        notify_cancelled_order,
        notify_admin_copy
        `
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error(error);
      setMessage("Грешка при зареждане на настройките.");
      setLoading(false);
      return;
    }

    setNotifyNewOrder(data?.notify_new_order ?? true);
    setNotifyShippedOrder(data?.notify_shipped_order ?? true);
    setNotifyDeliveredOrder(data?.notify_delivered_order ?? true);
    setNotifyCancelledOrder(data?.notify_cancelled_order ?? true);
    setNotifyAdminCopy(data?.notify_admin_copy ?? false);

    setLoading(false);
  }
async function loadTemplate(type: TemplateType) {
  if (!userId) {
    return;
  }

  setTemplateLoading(true);

  const { data, error } = await supabase
    .from("notification_templates")
    .select("id, user_id, type, subject, body")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    console.error(error);
    setMessage("Грешка при зареждане на шаблона.");
    setTemplateLoading(false);
    return;
  }

  if (data) {
    setTemplateSubject(data.subject || "");
    setTemplateBody(data.body || "");
  } else {
    setTemplateSubject(defaultTemplates[type].subject);
    setTemplateBody(defaultTemplates[type].body);
  }

  setTemplateLoading(false);
}
  async function saveNotificationSettings() {
    if (!userId) {
      setMessage("Липсва потребителски профил.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        notify_new_order: notifyNewOrder,
        notify_shipped_order: notifyShippedOrder,
        notify_delivered_order: notifyDeliveredOrder,
        notify_cancelled_order: notifyCancelledOrder,
        notify_admin_copy: notifyAdminCopy,
      })
      .eq("id", userId);

    if (error) {
      console.error(error);
      setMessage("Грешка при запазване на настройките.");
      setSaving(false);
      return;
    }

    setMessage("Настройките са запазени успешно.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        Зареждане на настройките...
      </main>
    );
  }
async function saveTemplate() {
  if (!userId) {
    setMessage("Липсва потребителски профил.");
    return;
  }

  setTemplateSaving(true);
  setMessage("");

  const templateData: NotificationTemplate = {
    user_id: userId,
    type: activeTemplate,
    subject: templateSubject,
    body: templateBody,
  };

  const { error } = await supabase
    .from("notification_templates")
    .upsert(templateData, {
      onConflict: "user_id,type",
    });

  if (error) {
    console.error(error);
    setMessage("Грешка при запазване на шаблона.");
    setTemplateSaving(false);
    return;
  }

  setMessage("Шаблонът е запазен успешно.");
  setTemplateSaving(false);
}
  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          🔔 Notifications Center
        </h1>

        <p className="mt-3 text-gray-600">
          Управление на автоматичните известия към клиентите.
        </p>

       {message && (
  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="font-semibold text-green-700">
      {message}
    </p>
  </div>
)}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">
            Имейл известия
          </h2>

          <div className="mt-6 space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>📦 Известие при нова поръчка</span>

              <input
                type="checkbox"
                checked={notifyNewOrder}
                onChange={(event) =>
                  setNotifyNewOrder(event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>🚚 Известие при изпратена поръчка</span>

              <input
                type="checkbox"
                checked={notifyShippedOrder}
                onChange={(event) =>
                  setNotifyShippedOrder(event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>✅ Известие при доставена поръчка</span>

              <input
                type="checkbox"
                checked={notifyDeliveredOrder}
                onChange={(event) =>
                  setNotifyDeliveredOrder(event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>❌ Известие при отказана поръчка</span>

              <input
                type="checkbox"
                checked={notifyCancelledOrder}
                onChange={(event) =>
                  setNotifyCancelledOrder(event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>👤 Копие до администратора</span>

              <input
                type="checkbox"
                checked={notifyAdminCopy}
                onChange={(event) =>
                  setNotifyAdminCopy(event.target.checked)
                }
                className="h-5 w-5"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={saveNotificationSettings}
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white disabled:bg-gray-400"
          >
            {saving
              ? "Запазване..."
              : "💾 Запази настройките"}
          </button>
        </div>
        <section className="mt-8 rounded-2xl bg-white p-8 shadow">
  <h2 className="text-2xl font-bold">
    ✉️ Шаблони за известия
  </h2>

  <p className="mt-2 text-gray-600">
    Редактирайте темата и текста на автоматичните имейли.
  </p>

  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <button
      type="button"
      onClick={() => setActiveTemplate("new_order")}
      className={`rounded-xl px-4 py-3 font-semibold ${
        activeTemplate === "new_order"
          ? "bg-blue-600 text-white"
          : "border bg-white"
      }`}
    >
      📦 Нова поръчка
    </button>

    <button
      type="button"
      onClick={() => setActiveTemplate("shipped")}
      className={`rounded-xl px-4 py-3 font-semibold ${
        activeTemplate === "shipped"
          ? "bg-blue-600 text-white"
          : "border bg-white"
      }`}
    >
      🚚 Изпратена
    </button>

    <button
      type="button"
      onClick={() => setActiveTemplate("delivered")}
      className={`rounded-xl px-4 py-3 font-semibold ${
        activeTemplate === "delivered"
          ? "bg-blue-600 text-white"
          : "border bg-white"
      }`}
    >
      ✅ Доставена
    </button>

    <button
      type="button"
      onClick={() => setActiveTemplate("cancelled")}
      className={`rounded-xl px-4 py-3 font-semibold ${
        activeTemplate === "cancelled"
          ? "bg-blue-600 text-white"
          : "border bg-white"
      }`}
    >
      ❌ Отказана
    </button>
  </div>

  {templateLoading ? (
    <p className="mt-8 text-gray-600">
      Зареждане на шаблона...
    </p>
  ) : (
    <div className="mt-8 grid gap-6">
      <div>
        <label className="font-semibold">
          Тема на имейла
        </label>

        <input
          value={templateSubject}
          onChange={(event) =>
            setTemplateSubject(event.target.value)
          }
          className="mt-2 w-full rounded-xl border p-4"
        />
      </div>

      <div>
        <label className="font-semibold">
          Съобщение
        </label>
<div className="rounded-xl border bg-gray-50 p-4">
  <p className="mb-3 font-semibold">
    🏷 Достъпни променливи
  </p>

  <div className="flex flex-wrap gap-2">
    {[
      "{CUSTOMER_NAME}",
      "{ORDER_ID}",
      "{PRODUCT_NAME}",
      "{COURIER}",
      "{TRACKING_NUMBER}",
      "{EXPECTED_DELIVERY}",
      "{STORE_NAME}",
    ].map((variable) => (
      <button
        key={variable}
        type="button"
        onClick={() =>
          setTemplateBody(
            (current) => current + " " + variable
          )
        }
        className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-blue-50"
      >
        {variable}
      </button>
    ))}
  </div>
</div>
        <textarea
          value={templateBody}
          onChange={(event) =>
            setTemplateBody(event.target.value)
          }
          className="mt-2 min-h-[300px] w-full rounded-xl border p-4"
        />
      </div>

      <button
        type="button"
        onClick={saveTemplate}
        disabled={templateSaving}
        className="rounded-xl bg-green-600 py-4 font-semibold text-white disabled:bg-gray-400"
      >
    {templateSaving
  ? "Запазване..."
  : "💾 Запази шаблона"}
</button>

<button
  type="button"
  onClick={() => setShowPreview(!showPreview)}
  className="mt-4 w-full rounded-xl border border-blue-600 py-4 font-semibold text-blue-600"
>
  {showPreview
    ? "🙈 Скрий прегледа"
    : "👁 Преглед"}
</button>
{showPreview && (
  <div className="mt-6 rounded-2xl border bg-gray-50 p-6">
    <h3 className="text-xl font-bold">
      👁 Преглед на имейла
    </h3>

    <div className="mt-5 rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        Тема
      </p>

      <p className="mt-2 text-lg font-bold">
        {templateSubject
          .replaceAll("{CUSTOMER_NAME}", "Иван Иванов")
          .replaceAll("{ORDER_ID}", "145")
          .replaceAll("{PRODUCT_NAME}", "Безжична мишка")
          .replaceAll("{COURIER}", "Speedy")
          .replaceAll("{TRACKING_NUMBER}", "SP123456789")
          .replaceAll("{EXPECTED_DELIVERY}", "25.07.2026")
          .replaceAll("{STORE_NAME}", "Vendora Demo Store")}
      </p>

    </div>

     <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        Съобщение
      </p>

      <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-800">
        {templateBody
          .replaceAll("{CUSTOMER_NAME}", "Иван Иванов")
          .replaceAll("{ORDER_ID}", "145")
          .replaceAll("{PRODUCT_NAME}", "Безжична мишка")
          .replaceAll("{COURIER}", "Speedy")
          .replaceAll("{TRACKING_NUMBER}", "SP123456789")
          .replaceAll("{EXPECTED_DELIVERY}", "25.07.2026")
          .replaceAll("{STORE_NAME}", "Vendora Demo Store")}
      </p>
    </div>
<input
  type="email"
  value={testEmail}
  onChange={(e) => setTestEmail(e.target.value)}
  placeholder="Въведете имейл за тест"
  className="mt-5 w-full rounded-xl border border-gray-300 p-4"
/>
<button
  type="button"
  onClick={async () => {
    if (!testEmail.trim()) {
  setMessage("❌ Въведете имейл адрес за тест.");
  return;
}
    setSendingTest(true);

    try {
    const response = await fetch("/api/send-test-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: testEmail,
  }),
});

      if (!response.ok) {
        throw new Error();
      }

      setMessage("✅ Тестовият имейл беше изпратен успешно.");
    } catch {
      setMessage("❌ Грешка при изпращане на тестовия имейл.");
    }

    setSendingTest(false);
  }}
  disabled={sendingTest}
  className="mt-5 w-full rounded-xl bg-purple-600 py-4 font-semibold text-white disabled:opacity-50"
>
  {sendingTest
    ? "Изпращане..."
    : "📧 Изпрати тестов имейл"}
</button>
  </div>
)}
    </div>
  )}
</section>
      </div>
    </main>
  );
}
