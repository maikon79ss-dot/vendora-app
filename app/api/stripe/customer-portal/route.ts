import {
  NextRequest,
  NextResponse,
} from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: NextRequest
) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Липсват настройки за Supabase.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    const supabaseAuth = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
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

    const authorization =
      request.headers.get(
        "authorization"
      );

    const accessToken =
      authorization?.replace(
        "Bearer ",
        ""
      );

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Няма потребителска сесия.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAuth.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Невалидна потребителска сесия.",
        },
        { status: 401 }
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "stripe_customer_id, subscription_status"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Customer Portal profile error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Профилът не беше намерен.",
        },
        { status: 404 }
      );
    }

    if (
      !profile?.stripe_customer_id
    ) {
      return NextResponse.json(
        {
          error:
            "Все още няма нов Stripe абонамент. Първо изберете месечен или годишен план.",
        },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const portal =
      await stripe.billingPortal.sessions.create({
        customer:
          profile.stripe_customer_id,

        return_url:
          `${siteUrl}/plan`,
      });

    return NextResponse.json({
      url: portal.url,
    });
  } catch (error) {
    console.error(
      "Stripe Customer Portal error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Неизвестна Stripe грешка.";

    return NextResponse.json(
      {
        error:
          "Грешка при Stripe Portal.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? message
            : undefined,
      },
      { status: 500 }
    );
  }
}