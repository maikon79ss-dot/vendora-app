import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret =
  process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Липсва STRIPE_SECRET_KEY.");
}

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Липсват сървърните настройки за Supabase."
  );
}

const stripe = new Stripe(stripeSecretKey);

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Липсва STRIPE_CONNECT_WEBHOOK_SECRET.",
      },
      { status: 500 }
    );
  }

  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Липсва Stripe подпис." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(
      "Connect webhook signature error:",
      error
    );

    return NextResponse.json(
      { error: "Невалиден Connect webhook подпис." },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type ===
        "checkout.session.async_payment_succeeded"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      if (
        session.metadata?.payment_type !==
        "store_order"
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      const checkoutId =
        session.metadata.checkout_id;

      if (!checkoutId) {
        return NextResponse.json(
          { error: "Липсва checkout_id." },
          { status: 400 }
        );
      }

      /*
       * Обновяваме само неплатени поръчки.
       * Ако Stripe повтори събитието, няма да
       * изпращаме втори имейл.
       */
      const {
        data: updatedOrders,
        error: updateError,
      } = await supabaseAdmin
        .from("orders")
        .update({
          status: "Платена",
          payment_method: "Stripe",
        })
        .eq("checkout_id", checkoutId)
        .neq("status", "Платена")
        .select(
          `
          customer_name,
          customer_email,
          product_name,
          quantity,
          total_price
          `
        );

      if (updateError) {
        console.error(
          "Order payment update error:",
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Поръчката не беше отбелязана като платена.",
          },
          { status: 500 }
        );
      }

      /*
       * Ако няма обновени редове, събитието вече
       * е обработено и не пращаме имейл повторно.
       */
      if (
        updatedOrders &&
        updatedOrders.length > 0
      ) {
        const firstOrder = updatedOrders[0];

        const total = updatedOrders.reduce(
          (sum, order) =>
            sum + Number(order.total_price || 0),
          0
        );

        const products = updatedOrders
          .map(
            (order) =>
              `${order.product_name} × ${order.quantity}`
          )
          .join("\n");

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000";

        try {
          await fetch(
            `${siteUrl}/api/send-order-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: firstOrder.customer_email,
                subject:
                  "Потвърждение за платена поръчка",
                message: `Здравейте, ${firstOrder.customer_name}!

Вашето плащане беше успешно.

Номер на поръчката: ${checkoutId}

Продукти:
${products}

Обща стойност: ${total.toFixed(2)} €
Начин на плащане: Stripe

Продавачът ще обработи поръчката ви.

Поздрави,
Vendora`,
              }),
            }
          );
        } catch (emailError) {
          /*
           * Не връщаме Stripe грешка, защото
           * плащането и поръчката са обработени.
           */
          console.error(
            "Paid order email error:",
            emailError
          );
        }
      }

      console.log(
        `Платена Stripe поръчка: ${checkoutId}`
      );
    }

    if (
      event.type ===
      "checkout.session.async_payment_failed"
    ) {
      const session =
        event.data.object as Stripe.Checkout.Session;

      const checkoutId =
        session.metadata?.checkout_id;

      if (checkoutId) {
        await supabaseAdmin
          .from("orders")
          .update({
            status: "Неуспешно плащане",
          })
          .eq("checkout_id", checkoutId);
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Connect webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Грешка при обработване на Connect webhook.",
      },
      { status: 500 }
    );
  }
}