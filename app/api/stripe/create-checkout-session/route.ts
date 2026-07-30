import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!stripeSecretKey) {
  throw new Error("Липсва STRIPE_SECRET_KEY в .env.local");
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Липсват настройките за Supabase.");
}

const stripe = new Stripe(stripeSecretKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Не сте влезли в профила си." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Невалидна потребителска сесия." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body.plan as string;

    if (
      plan !== "premium_monthly" &&
      plan !== "premium_yearly"
    ) {
      return NextResponse.json(
        { error: "Невалиден абонаментен план." },
        { status: 400 }
      );
    }

const promoActive =
  process.env.PROMO_ACTIVE === "true";

let priceId: string | undefined;

if (plan === "premium_monthly") {
  priceId = promoActive
    ? process.env.STRIPE_PRICE_MONTHLY_PROMO
    : process.env.STRIPE_PRICE_MONTHLY_STANDARD;
}

if (plan === "premium_yearly") {
  priceId = promoActive
    ? process.env.STRIPE_PRICE_YEARLY_PROMO
    : process.env.STRIPE_PRICE_YEARLY_STANDARD;
}
    if (!priceId) {
      return NextResponse.json(
        { error: "Липсва Price ID за избрания план." },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        customer_email: user.email,

        client_reference_id: user.id,

        metadata: {
          user_id: user.id,
          plan,
        },

        subscription_data: {
          metadata: {
            user_id: user.id,
            plan,
          },
        },

        success_url:
          `${siteUrl}/plan/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${siteUrl}/plan`,
      });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe не върна адрес за плащане." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe Checkout error:", error);

    return NextResponse.json(
      { error: "Неуспешно създаване на плащането." },
      { status: 500 }
    );
  }
}