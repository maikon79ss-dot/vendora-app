import {
  NextRequest,
  NextResponse,
} from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type VendoraPlan =
  | "premium_monthly"
  | "premium_yearly";

function isVendoraPlan(
  value: string | null | undefined
): value is VendoraPlan {
  return (
    value === "premium_monthly" ||
    value === "premium_yearly"
  );
}

function getStripeId(
  value:
    | string
    | { id: string }
    | null
    | undefined
) {
  if (typeof value === "string") {
    return value;
  }

  return value?.id || null;
}

/*
 * Stripe има различни версии на Invoice.
 * Тази функция поддържа както старото поле
 * invoice.subscription, така и новото
 * parent.subscription_details.subscription.
 */
function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | null {
  const invoiceData =
    invoice as Stripe.Invoice & {
      subscription?:
        | string
        | Stripe.Subscription
        | null;

      parent?: {
        subscription_details?: {
          subscription?:
            | string
            | Stripe.Subscription
            | null;
        } | null;
      } | null;
    };

  const subscription =
    invoiceData.subscription ||
    invoiceData.parent
      ?.subscription_details
      ?.subscription;

  return getStripeId(subscription);
}

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

  /*
   * Намира Vendora профила чрез:
   * 1. user_id от Stripe metadata;
   * 2. stripe_subscription_id;
   * 3. stripe_customer_id.
   */
  async function findUserId(params: {
    metadataUserId?:
      | string
      | null;

    subscriptionId?:
      | string
      | null;

    customerId?:
      | string
      | null;
  }): Promise<string | null> {
    if (params.metadataUserId) {
      return params.metadataUserId;
    }

    if (params.subscriptionId) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq(
          "stripe_subscription_id",
          params.subscriptionId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Profile lookup by subscription error:",
          error
        );
      }

      if (data?.id) {
        return data.id;
      }
    }

    if (params.customerId) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq(
          "stripe_customer_id",
          params.customerId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Profile lookup by customer error:",
          error
        );
      }

      if (data?.id) {
        return data.id;
      }
    }

    return null;
  }

  async function updateProfile(
    userId: string,
    values: Record<
      string,
      string | boolean | null
    >
  ) {
    const { error } =
      await supabaseAdmin
        .from("profiles")
        .update(values)
        .eq("id", userId);

    if (error) {
      console.error(
        "Profile update error:",
        error
      );

      throw new Error(
        "Неуспешно обновяване на профила."
      );
    }
  }

  try {
    switch (event.type) {
      /*
       * Първа успешна покупка на
       * месечен или годишен Premium.
       */
      case "checkout.session.completed": {
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
          !isVendoraPlan(plan)
        ) {
          console.error(
            "Липсват user_id или валиден plan в Checkout metadata."
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
          getStripeId(
            session.customer
          );

        const subscriptionId =
          getStripeId(
            session.subscription
          );

        await updateProfile(
          userId,
          {
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
          }
        );

        /*
         * Предпазване от дублиран
         * запис при повторен webhook.
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

          throw new Error(
            "Неуспешна проверка на плащането."
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
                  new Date()
                    .toISOString(),
              },
            ]);

          if (paymentError) {
            console.error(
              "Payment record error:",
              paymentError
            );

            throw new Error(
              "Неуспешно записване на плащането."
            );
          }
        }

        console.log(
          `Premium активиран за ${userId}: ${plan}`
        );

        break;
      }

      /*
       * Изпълнява се при:
       * - натискане на отказване;
       * - включване на cancel_at_period_end;
       * - промяна на статус;
       * - подновяване или промяна на план.
       */
      case "customer.subscription.updated": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        const subscriptionId =
          subscription.id;

        const customerId =
          getStripeId(
            subscription.customer
          );

        const metadataUserId =
          subscription.metadata
            ?.user_id;

        const metadataPlan =
          subscription.metadata?.plan;

        const userId =
          await findUserId({
            metadataUserId,
            subscriptionId,
            customerId,
          });

        if (!userId) {
          console.error(
            "Не е намерен профил за обновения абонамент:",
            subscriptionId
          );

          break;
        }

        /*
         * При cancel_at_period_end=true
         * потребителят запазва Premium,
         * докато Stripe действително изпрати
         * customer.subscription.deleted.
         */
        const premiumIsActive =
          subscription.status ===
            "active" ||
          subscription.status ===
            "trialing" ||
          subscription.status ===
            "past_due";

        const subscriptionEnded =
          subscription.status ===
            "canceled" ||
          subscription.status ===
            "unpaid" ||
          subscription.status ===
            "incomplete_expired";

        const values: Record<
          string,
          string | boolean | null
        > = {
          subscription_status:
            subscription.status,

          stripe_customer_id:
            customerId,

          stripe_subscription_id:
            subscriptionId,

          cancel_at_period_end:
            subscription
              .cancel_at_period_end,
        };

        if (
          isVendoraPlan(
            metadataPlan
          )
        ) {
          values.subscription_plan =
            metadataPlan;
        }

        if (premiumIsActive) {
          values.plan = "premium";
        }

        if (subscriptionEnded) {
          values.plan = "free";
          values.subscription_plan =
            "free";
        }

        await updateProfile(
          userId,
          values
        );

        console.log(
          `Абонаментът е обновен за ${userId}: ${subscription.status}`
        );

        break;
      }

      /*
       * Изпраща се, когато абонаментът
       * действително приключи.
       */
      case "customer.subscription.deleted": {
        const subscription =
          event.data
            .object as Stripe.Subscription;

        const customerId =
          getStripeId(
            subscription.customer
          );

        const userId =
          await findUserId({
            metadataUserId:
              subscription.metadata
                ?.user_id,

            subscriptionId:
              subscription.id,

            customerId,
          });

        if (!userId) {
          console.error(
            "Не е намерен профил за прекратения абонамент:",
            subscription.id
          );

          break;
        }

        await updateProfile(
          userId,
          {
            plan: "free",

            subscription_plan:
              "free",

            subscription_status:
              "canceled",

            cancel_at_period_end:
              false,

            stripe_subscription_id:
              null,
          }
        );

        console.log(
          `Premium е прекратен за ${userId}.`
        );

        break;
      }

      /*
       * Успешно първо или последващо
       * месечно/годишно плащане.
       */
      case "invoice.paid": {
        const invoice =
          event.data
            .object as Stripe.Invoice;

        const subscriptionId =
          getInvoiceSubscriptionId(
            invoice
          );

        if (!subscriptionId) {
          /*
           * Това може да е обикновена
           * фактура, която не е свързана
           * с Premium абонамент.
           */
          break;
        }

        const subscription =
          await stripe.subscriptions
            .retrieve(
              subscriptionId
            );

        const customerId =
          getStripeId(
            subscription.customer
          );

        const userId =
          await findUserId({
            metadataUserId:
              subscription.metadata
                ?.user_id,

            subscriptionId:
              subscription.id,

            customerId,
          });

        if (!userId) {
          console.error(
            "Не е намерен профил за платената фактура:",
            invoice.id
          );

          break;
        }

        const plan =
          subscription.metadata?.plan;

        const values: Record<
          string,
          string | boolean | null
        > = {
          plan: "premium",

          subscription_status:
            subscription.status,

          stripe_customer_id:
            customerId,

          stripe_subscription_id:
            subscription.id,

          cancel_at_period_end:
            subscription
              .cancel_at_period_end,
        };

        if (isVendoraPlan(plan)) {
          values.subscription_plan =
            plan;
        }

        await updateProfile(
          userId,
          values
        );

        console.log(
          `Успешно плащане за ${userId}: ${invoice.id}`
        );

        break;
      }

      /*
       * Неуспешно автоматично подновяване.
       * Не сваляме Premium веднага, защото
       * Stripe може да направи нов опит.
       */
      case "invoice.payment_failed": {
        const invoice =
          event.data
            .object as Stripe.Invoice;

        const subscriptionId =
          getInvoiceSubscriptionId(
            invoice
          );

        if (!subscriptionId) {
          break;
        }

        const subscription =
          await stripe.subscriptions
            .retrieve(
              subscriptionId
            );

        const customerId =
          getStripeId(
            subscription.customer
          );

        const userId =
          await findUserId({
            metadataUserId:
              subscription.metadata
                ?.user_id,

            subscriptionId:
              subscription.id,

            customerId,
          });

        if (!userId) {
          console.error(
            "Не е намерен профил за неуспешното плащане:",
            invoice.id
          );

          break;
        }

        await updateProfile(
          userId,
          {
            /*
             * Оставяме plan: premium
             * временно, докато Stripe
             * прави повторни опити.
             */
            subscription_status:
              "past_due",

            cancel_at_period_end:
              subscription
                .cancel_at_period_end,
          }
        );

        console.log(
          `Неуспешно плащане за ${userId}: ${invoice.id}`
        );

        break;
      }

      default: {
        console.log(
          `Необработено Stripe събитие: ${event.type}`
        );
      }
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