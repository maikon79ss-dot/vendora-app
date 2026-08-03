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
            "Липсват настройките за Supabase.",
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    /*
     * Този клиент се използва само
     * за проверка на влезлия потребител.
     */
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

    /*
     * Този клиент се използва само
     * на сървъра за записване
     * на Stripe данните.
     */
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
            "Не сте влезли в профила си.",
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
        `
        id,
        email,
        first_name,
        last_name,
        stripe_account_id
        `
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "Profile error:",
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

    let stripeAccountId =
      profile.stripe_account_id;

    /*
     * Създаваме нов Express акаунт
     * само ако продавачът още няма
     * Stripe acct_ номер.
     */
    if (!stripeAccountId) {
      const account =
        await stripe.accounts.create({
          type: "express",

          email:
            profile.email ||
            user.email ||
            undefined,

          capabilities: {
            card_payments: {
              requested: true,
            },

            transfers: {
              requested: true,
            },
          },

          business_profile: {
            product_description:
              "Продажба на продукти чрез Vendora",
          },

          metadata: {
            vendora_user_id: user.id,
          },
        });

      stripeAccountId = account.id;

      const { error: updateError } =
        await supabaseAdmin
          .from("profiles")
          .update({
            stripe_account_id:
              stripeAccountId,

            stripe_enabled: false,

            stripe_charges_enabled:
              false,

            stripe_payouts_enabled:
              false,

            stripe_details_submitted:
              false,
          })
          .eq("id", user.id);

      if (updateError) {
        console.error(
          "Stripe account save error:",
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Stripe акаунтът беше създаден, но не беше записан в профила.",
          },
          { status: 500 }
        );
      }
    }

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const accountLink =
      await stripe.accountLinks.create({
        account: stripeAccountId,

        type: "account_onboarding",

        refresh_url:
          `${siteUrl}/settings?stripe=refresh`,

        return_url:
          `${siteUrl}/settings?stripe=return`,

        collection_options: {
          fields: "eventually_due",
          future_requirements:
            "include",
        },
      });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error(
      "Stripe Connect error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Неизвестна Stripe грешка.";

    return NextResponse.json(
  {
   error: "Неуспешно свързване със Stripe.",
  },
  { status: 500 }
);
}
  }
