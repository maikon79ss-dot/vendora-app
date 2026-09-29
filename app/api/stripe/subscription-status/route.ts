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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (
      !stripeSecretKey ||
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Липсват необходимите настройки.",
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
        "stripe_subscription_id"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Subscription profile error:",
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

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({
        status: null,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      });
    }

    const subscription =
      await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );

    const subscriptionData =
      subscription as unknown as {
        current_period_end?: number;
        items?: {
          data?: Array<{
            current_period_end?: number;
          }>;
        };
      };

    const currentPeriodEnd =
      subscriptionData.items?.data?.[0]
        ?.current_period_end ??
      subscriptionData.current_period_end ??
      null;

    return NextResponse.json({
      status: subscription.status,

      cancelAtPeriodEnd:
        subscription.cancel_at_period_end,

      currentPeriodEnd:
        currentPeriodEnd
          ? new Date(
              currentPeriodEnd * 1000
            ).toISOString()
          : null,
    });
  } catch (error) {
    console.error(
      "Stripe subscription status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Грешка при проверка на абонамента.",
      },
      { status: 500 }
    );
  }
}
