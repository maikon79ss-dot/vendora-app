import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

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

type ConfirmSubscriptionBody = {
  sessionId?: string;
};

type VendoraPlan =
  | "premium_monthly"
  | "premium_yearly";

export async function POST(request: NextRequest) {
  try {
    const body =
      (await request.json()) as ConfirmSubscriptionBody;

    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(
        {
          error:
            "Липсва Stripe Checkout Session ID.",
        },
        { status: 400 }
      );
    }

    /*
     * Извличаме реалната Checkout Session
     * директно от Stripe.
     */
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: [
            "subscription",
            "subscription.latest_invoice",
          ],
        }
      );

    if (checkoutSession.mode !== "subscription") {
      return NextResponse.json(
        {
          error:
            "Тази Stripe сесия не е за абонамент.",
        },
        { status: 400 }
      );
    }

    const userId =
      checkoutSession.metadata?.user_id ||
      checkoutSession.client_reference_id;

    const plan =
      checkoutSession.metadata?.plan as
        | VendoraPlan
        | undefined;

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "В Stripe сесията липсва потребител.",
        },
        { status: 400 }
      );
    }

    if (
      plan !== "premium_monthly" &&
      plan !== "premium_yearly"
    ) {
      return NextResponse.json(
        {
          error:
            "В Stripe сесията липсва валиден план.",
        },
        { status: 400 }
      );
    }

    /*
     * За първото плащане очакваме paid
     * или no_payment_required при специален случай.
     */
    if (
      checkoutSession.payment_status !== "paid" &&
      checkoutSession.payment_status !==
        "no_payment_required"
    ) {
      return NextResponse.json(
        {
          error:
            "Плащането още не е потвърдено от Stripe.",
          paymentStatus:
            checkoutSession.payment_status,
        },
        { status: 400 }
      );
    }

    const subscription =
      typeof checkoutSession.subscription ===
      "string"
        ? await stripe.subscriptions.retrieve(
            checkoutSession.subscription
          )
        : checkoutSession.subscription;

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            "Stripe не върна създаден абонамент.",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "active",
      "trialing",
    ];

    if (
      !allowedStatuses.includes(subscription.status)
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe абонаментът още не е активен.",
          subscriptionStatus:
            subscription.status,
        },
        { status: 400 }
      );
    }

    /*
     * Проверяваме отново metadata на Subscription,
     * ако Stripe я е върнал там.
     */
    const subscriptionUserId =
      subscription.metadata?.user_id;

    const subscriptionPlan =
      subscription.metadata?.plan;

    if (
      subscriptionUserId &&
      subscriptionUserId !== userId
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe абонаментът не съответства на потребителя.",
        },
        { status: 400 }
      );
    }

    if (
      subscriptionPlan &&
      subscriptionPlan !== plan
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe абонаментът не съответства на избрания план.",
        },
        { status: 400 }
      );
    }

    const customerId =
      typeof checkoutSession.customer === "string"
        ? checkoutSession.customer
        : checkoutSession.customer?.id || null;

    const subscriptionId = subscription.id;

    /*
     * В актуалния Stripe обект периодът се намира
     * в Subscription Item.
     */
    const firstSubscriptionItem =
      subscription.items.data[0];

    const currentPeriodEnd =
      firstSubscriptionItem?.current_period_end
        ? new Date(
            firstSubscriptionItem.current_period_end *
              1000
          ).toISOString()
        : null;

    const cancelAtPeriodEnd =
      subscription.cancel_at_period_end ?? false;

    /*
     * Активираме Premium в профила.
     */
    console.log("Stripe userId:", userId);
console.log("Stripe plan:", plan);

const {
  data: updatedProfile,
  error: profileError,
} = await supabaseAdmin
  .from("profiles")
  .update({
    plan: "premium",
    subscription_plan: plan,
    subscription_status: subscription.status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
  })
  .eq("id", userId)
  .select(`
    id,
    plan,
    subscription_plan,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id
  `)
  .maybeSingle();

if (profileError) {
  console.error(
    "Confirm subscription profile error:",
    profileError
  );

  return NextResponse.json(
    {
      error:
        "Premium планът не можа да бъде активиран.",
    },
    { status: 500 }
  );
}

if (!updatedProfile) {
  console.error(
    "Не е намерен profiles ред за userId:",
    userId
  );

  return NextResponse.json(
    {
      error:
        "Плащането е успешно, но потребителският профил не беше намерен.",
      userId:
        process.env.NODE_ENV === "development"
          ? userId
          : undefined,
    },
    { status: 404 }
  );
}

console.log(
  "Premium profile updated:",
  updatedProfile
);
        

    if (profileError) {
      console.error(
        "Confirm subscription profile error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Premium планът не можа да бъде активиран.",
        },
        { status: 500 }
      );
    }

    /*
     * Проверяваме дали тази Checkout Session
     * вече е записана, за да няма дублиране,
     * ако success страницата се отвори повторно.
     */
    const {
      data: existingPayment,
      error: existingPaymentError,
    } = await supabaseAdmin
      .from("subscription_payments")
      .select("id")
      .eq(
        "stripe_checkout_session_id",
        checkoutSession.id
      )
      .maybeSingle();

    if (existingPaymentError) {
      console.error(
        "Existing subscription payment error:",
        existingPaymentError
      );

      return NextResponse.json(
        {
          error:
            "Неуспешна проверка на историята на плащанията.",
        },
        { status: 500 }
      );
    }

    if (!existingPayment) {
      const amount =
        Number(checkoutSession.amount_total || 0) /
        100;

      const latestInvoice =
        typeof subscription.latest_invoice ===
        "string"
          ? subscription.latest_invoice
          : subscription.latest_invoice?.id || null;

      const { error: paymentError } =
        await supabaseAdmin
          .from("subscription_payments")
          .insert([
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id:
                subscriptionId,
              stripe_invoice_id: latestInvoice,
              stripe_checkout_session_id:
                checkoutSession.id,
              plan,
              amount,
              currency:
                checkoutSession.currency || "eur",
              status: "paid",
              paid_at: new Date().toISOString(),
            },
          ]);

      if (paymentError) {
        console.error(
          "Confirm subscription payment error:",
          paymentError
        );

        return NextResponse.json(
          {
            error:
              "Плащането е успешно, но историята не можа да бъде записана.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      subscriptionStatus:
        subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    });
  } catch (error) {
    console.error(
      "Confirm subscription error:",
      error
    );

    const details =
      error instanceof Error
        ? error.message
        : "Неизвестна грешка.";

    return NextResponse.json(
      {
        error:
          "Абонаментът не можа да бъде потвърден.",
        details:
          process.env.NODE_ENV ===
          "development"
            ? details
            : undefined,
      },
      { status: 500 }
    );
  }
}