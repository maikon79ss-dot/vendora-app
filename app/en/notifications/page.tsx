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
  language: "bg" | "en";
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
      subject: "We received your order #{ORDER_ID}",
      body: `Hello {CUSTOMER_NAME},

We received your order #{ORDER_ID}.

Product: {PRODUCT_NAME}

Thank you,
{STORE_NAME}`,
    },

    shipped: {
      subject: "Your order #{ORDER_ID} has been shipped",
      body: `Hello {CUSTOMER_NAME},

Your order #{ORDER_ID} has been shipped.

Courier: {COURIER}
Tracking number: {TRACKING_NUMBER}
Expected delivery: {EXPECTED_DELIVERY}

Thank you,
{STORE_NAME}`,
    },

    delivered: {
      subject: "Your order #{ORDER_ID} has been delivered",
      body: `Hello {CUSTOMER_NAME},

Your order #{ORDER_ID} has been delivered successfully.

Thank you for shopping with {STORE_NAME}.`,
    },

    cancelled: {
      subject: "Your order #{ORDER_ID} has been cancelled",
      body: `Hello {CUSTOMER_NAME},

Your order #{ORDER_ID} has been cancelled.

If you have any questions, please contact {STORE_NAME}.`,
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
      setMessage("Error while checking the user session.");
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/en/login");
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
      setMessage("Error while loading notification settings.");
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
      .select("id, user_id, type, language, subject, body")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("language", "en")
      .maybeSingle();

    if (error) {
      console.error(error);
      setMessage("Error while loading the template.");
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
      setMessage("User profile is missing.");
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
      setMessage("Error while saving notification settings.");
      setSaving(false);
      return;
    }

    setMessage("Notification settings saved successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main
        lang="en"
        className="min-h-screen bg-gray-100 p-10"
      >
        Loading notification settings...
      </main>
    );
  }

  async function saveTemplate() {
    if (!userId) {
      setMessage("User profile is missing.");
      return;
    }

    setTemplateSaving(true);
    setMessage("");

    const templateData: NotificationTemplate = {
      user_id: userId,
      type: activeTemplate,
      language: "en",
      subject: templateSubject,
      body: templateBody,
    };

    const { error } = await supabase
      .from("notification_templates")
      .upsert(templateData, {
        onConflict: "user_id,type,language",
      });

    if (error) {
      console.error(error);
      setMessage("Error while saving the template.");
      setTemplateSaving(false);
      return;
    }

    setMessage("Template saved successfully.");
    setTemplateSaving(false);
  }

  return (
    <main
      lang="en"
      className="min-h-screen bg-gray-100 p-6 md:p-10"
    >
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">
          🔔 Notifications Center
        </h1>

        <p className="mt-3 text-gray-600">
          Manage automatic notifications sent to your customers.
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
            Email notifications
          </h2>

          <div className="mt-6 space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <span>📦 New order notification</span>

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
              <span>🚚 Shipped order notification</span>

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
              <span>✅ Delivered order notification</span>

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
              <span>❌ Cancelled order notification</span>

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
              <span>👤 Send a copy to the administrator</span>

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
              ? "Saving..."
              : "💾 Save notification settings"}
          </button>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold">
            ✉️ Notification templates
          </h2>

          <p className="mt-2 text-gray-600">
            Edit the subject and message of your automatic emails.
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
              📦 New order
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
              🚚 Shipped
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
              ✅ Delivered
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
              ❌ Cancelled
            </button>
          </div>

          {templateLoading ? (
            <p className="mt-8 text-gray-600">
              Loading template...
            </p>
          ) : (
            <div className="mt-8 grid gap-6">
              <div>
                <label className="font-semibold">
                  Email subject
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
                  Message
                </label>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="mb-3 font-semibold">
                    🏷 Available variables
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
                            (current) =>
                              current + " " + variable
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
                  ? "Saving..."
                  : "💾 Save template"}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="mt-4 w-full rounded-xl border border-blue-600 py-4 font-semibold text-blue-600"
              >
                {showPreview
                  ? "🙈 Hide preview"
                  : "👁 Preview"}
              </button>

              {showPreview && (
                <div className="mt-6 rounded-2xl border bg-gray-50 p-6">
                  <h3 className="text-xl font-bold">
                    👁 Email preview
                  </h3>

                  <div className="mt-5 rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500">
                      Subject
                    </p>

                    <p className="mt-2 text-lg font-bold">
                      {templateSubject
                        .replaceAll(
                          "{CUSTOMER_NAME}",
                          "John Smith"
                        )
                        .replaceAll("{ORDER_ID}", "145")
                        .replaceAll(
                          "{PRODUCT_NAME}",
                          "Wireless mouse"
                        )
                        .replaceAll(
                          "{COURIER}",
                          "Speedy"
                        )
                        .replaceAll(
                          "{TRACKING_NUMBER}",
                          "SP123456789"
                        )
                        .replaceAll(
                          "{EXPECTED_DELIVERY}",
                          "25/07/2026"
                        )
                        .replaceAll(
                          "{STORE_NAME}",
                          "Vendora Demo Store"
                        )}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500">
                      Message
                    </p>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-800">
                      {templateBody
                        .replaceAll(
                          "{CUSTOMER_NAME}",
                          "John Smith"
                        )
                        .replaceAll("{ORDER_ID}", "145")
                        .replaceAll(
                          "{PRODUCT_NAME}",
                          "Wireless mouse"
                        )
                        .replaceAll(
                          "{COURIER}",
                          "Speedy"
                        )
                        .replaceAll(
                          "{TRACKING_NUMBER}",
                          "SP123456789"
                        )
                        .replaceAll(
                          "{EXPECTED_DELIVERY}",
                          "25/07/2026"
                        )
                        .replaceAll(
                          "{STORE_NAME}",
                          "Vendora Demo Store"
                        )}
                    </p>
                  </div>

                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) =>
                      setTestEmail(e.target.value)
                    }
                    placeholder="Enter an email address for testing"
                    className="mt-5 w-full rounded-xl border border-gray-300 p-4"
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      if (!testEmail.trim()) {
                        setMessage(
                          "❌ Enter an email address for testing."
                        );
                        return;
                      }

                      setSendingTest(true);

                      try {
                        const response = await fetch(
                          "/api/send-test-email",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type":
                                "application/json",
                            },
                            body: JSON.stringify({
                              to: testEmail,
                            }),
                          }
                        );

                        if (!response.ok) {
                          throw new Error();
                        }

                        setMessage(
                          "✅ Test email sent successfully."
                        );
                      } catch {
                        setMessage(
                          "❌ Error while sending the test email."
                        );
                      }

                      setSendingTest(false);
                    }}
                    disabled={sendingTest}
                    className="mt-5 w-full rounded-xl bg-purple-600 py-4 font-semibold text-white disabled:opacity-50"
                  >
                    {sendingTest
                      ? "Sending..."
                      : "📧 Send test email"}
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
