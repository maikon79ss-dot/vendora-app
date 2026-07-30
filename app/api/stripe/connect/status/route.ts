import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Липсва STRIPE_SECRET_KEY.");
}

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  !supabaseSecretKey
) {
  throw new Error("Липсват настройките за Supabase.");
}

const stripe = new Stripe(stripeSecretKey);

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

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const accessToken =
      authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Не сте влезли в профила си." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Невалидна потребителска сесия." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("stripe_account_id")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Профилът не беше намерен." },
        { status: 404 }
      );
    }

    if (!profile.stripe_account_id) {
      return NextResponse.json(
        {
          error:
            "Няма свързан Stripe акаунт.",
        },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(
      profile.stripe_account_id
    );

    const chargesEnabled =
      account.charges_enabled === true;

    const payoutsEnabled =
      account.payouts_enabled === true;

    const detailsSubmitted =
      account.details_submitted === true;

    const stripeEnabled =
      chargesEnabled && detailsSubmitted;

    const { error: updateError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          stripe_enabled: stripeEnabled,
          stripe_charges_enabled: chargesEnabled,
          stripe_payouts_enabled: payoutsEnabled,
          stripe_details_submitted: detailsSubmitted,
        })
        .eq("id", user.id);

    if (updateError) {
      console.error(
        "Stripe status update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Stripe статусът не можа да бъде записан.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
  connected: true,
  stripeEnabled,
  chargesEnabled,
  payoutsEnabled,
  detailsSubmitted,
  accountId: account.id,

  requirements: {
    currentlyDue:
      account.requirements?.currently_due || [],

    eventuallyDue:
      account.requirements?.eventually_due || [],

    pastDue:
      account.requirements?.past_due || [],

    pendingVerification:
      account.requirements?.pending_verification || [],

    disabledReason:
      account.requirements?.disabled_reason || null,

    errors:
      account.requirements?.errors || [],
  },
});
  } catch (error) {
    console.error(
      "Stripe status error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Неуспешна проверка на Stripe акаунта.",
      },
      { status: 500 }
    );
  }
}