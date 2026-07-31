import {
  NextRequest,
  NextResponse,
} from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest
) {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      {
        error:
          "Липсва STRIPE_SECRET_KEY.",
      },
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Липсва STRIPE_WEBHOOK_SECRET.",
      },
      { status: 500 }
    );
  }

  if (
    !supabaseUrl ||
    !supabaseSecretKey
  ) {
    return NextResponse.json(
      {
        error:
          "Липсват сървърните настройки за Supabase.",
      },
      { status: 500 }
    );
  }

  const stripe = new Stripe(
    stripeSecretKey
  );

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

  const signature =
    request.headers.get(
      "stripe-signature"
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Липсва Stripe подпис.",
      },
      { status: 400 }
    );
  }

  const rawBody =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
  } catch (error) {
    console.error(
      "Webhook signature error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Невалиден Stripe webhook подпис.",
      },
      { status: 400 }
    );
  }

  try {
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data
          .object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.user_id ||
        session.client_reference_id;

      const plan =
        session.metadata?.plan;

      if (
        !userId ||
        (
          plan !==
            "premium_monthly" &&
          plan !==
            "premium_yearly"
        )
      ) {
        console.error(
          "Липсват user_id или валиден plan в Stripe metadata."
        );

        return NextResponse.json(
          {
            error:
              "Липсват данни за потребителя или плана.",
          },
          { status: 400 }
        );
      }

      const customerId =
        typeof session.customer ===
        "string"
          ? session.customer
          : session.customer?.id ||
            null;

      const subscriptionId =
        typeof session.subscription ===
        "string"
          ? session.subscription
          : session.subscription?.id ||
            null;

      const {
        error: profileError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          plan: "premium",

          subscription_plan:
            plan,

          subscription_status:
            "active",

          stripe_customer_id:
            customerId,

          stripe_subscription_id:
            subscriptionId,

          cancel_at_period_end:
            false,
        })
        .eq("id", userId);

      if (profileError) {
        console.error(
          "Profile update error:",
          profileError
        );

        return NextResponse.json(
          {
            error:
              "Неуспешно активиране на Premium.",
          },
          { status: 500 }
        );
      }

      /*
       * Проверяваме дали тази Stripe сесия
       * вече е записана. Това предпазва от
       * дублиран запис при повторен webhook.
       */
      const {
        data: existingPayment,
        error:
          existingPaymentError,
      } = await supabaseAdmin
        .from(
          "subscription_payments"
        )
        .select("id")
        .eq(
          "stripe_checkout_session_id",
          session.id
        )
        .maybeSingle();

      if (existingPaymentError) {
        console.error(
          "Payment lookup error:",
          existingPaymentError
        );

        return NextResponse.json(
          {
            error:
              "Неуспешна проверка на плащането.",
          },
          { status: 500 }
        );
      }

      if (!existingPayment) {
        const amount =
          Number(
            session.amount_total || 0
          ) / 100;

        const {
          error: paymentError,
        } = await supabaseAdmin
          .from(
            "subscription_payments"
          )
          .insert([
            {
              user_id:
                userId,

              stripe_customer_id:
                customerId,

              stripe_subscription_id:
                subscriptionId,

              stripe_checkout_session_id:
                session.id,

              plan,

              amount,

              currency:
                session.currency ||
                "eur",

              status:
                session.payment_status ||
                "paid",

              paid_at:
                new Date().toISOString(),
            },
          ]);

        if (paymentError) {
          console.error(
            "Payment record error:",
            paymentError
          );

          return NextResponse.json(
            {
              error:
                "Неуспешно записване на плащането.",
            },
            { status: 500 }
          );
        }
      }

      console.log(
        `Premium активиран за ${userId}: ${plan}`
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Грешка при обработване на webhook.",
      },
      { status: 500 }
    );
  }
}