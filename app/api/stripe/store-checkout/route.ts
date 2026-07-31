import {
  NextRequest,
  NextResponse,
} from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

type CheckoutItem = {
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
  variant?: string | null;
  ownerId: string;
};

type StoreCheckoutBody = {
  checkoutId: string;
  customerEmail: string;
  ownerId: string;
  items: CheckoutItem[];
  discountAmount?: number;
};

export async function POST(
  request: NextRequest
) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

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

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const body =
      (await request.json()) as StoreCheckoutBody;

    const {
      checkoutId,
      customerEmail,
      ownerId,
      items,
      discountAmount = 0,
    } = body;

    if (
      !checkoutId ||
      !customerEmail ||
      !ownerId
    ) {
      return NextResponse.json(
        {
          error:
            "Липсват данни за поръчката.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Количката е празна.",
        },
        { status: 400 }
      );
    }

    const hasDifferentOwner =
      items.some(
        (item) =>
          item.ownerId !== ownerId
      );

    if (hasDifferentOwner) {
      return NextResponse.json(
        {
          error:
            "Stripe плащането може да съдържа продукти само от един магазин.",
        },
        { status: 400 }
      );
    }

    const {
      data: seller,
      error: sellerError,
    } = await supabaseAdmin
      .from("profiles")
    .select(
  `
  id,
  store_slug,
  stripe_account_id,
  stripe_enabled,
  stripe_charges_enabled,
  stripe_details_submitted
  `
)
      .eq("id", ownerId)
      .single();

    if (
      sellerError ||
      !seller
    ) {
      console.error(
        "Seller profile error:",
        sellerError
      );

      return NextResponse.json(
        {
          error:
            "Профилът на продавача не беше намерен.",
        },
        { status: 404 }
      );
    }
const storeSlug = seller.store_slug;

if (!storeSlug) {
  return NextResponse.json(
    {
      error:
        "Магазинът на продавача няма валиден адрес.",
    },
    { status: 400 }
  );
}
    if (
      !seller.stripe_account_id
    ) {
      return NextResponse.json(
        {
          error:
            "Продавачът още не е свързал Stripe акаунт.",
        },
        { status: 400 }
      );
    }

    const connectedAccount =
      await stripe.accounts.retrieve(
        seller.stripe_account_id
      );

    if (
      !connectedAccount.charges_enabled ||
      !connectedAccount.details_submitted
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe акаунтът на продавача още не е готов да приема плащания.",
        },
        { status: 400 }
      );
    }

    const originalTotal =
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price) *
            Number(item.quantity),
        0
      );

    const safeDiscount =
      Math.min(
        Math.max(
          Number(discountAmount) || 0,
          0
        ),
        originalTotal
      );

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => {
        const itemSubtotal =
          Number(item.price) *
          Number(item.quantity);

        const itemDiscount =
          originalTotal > 0
            ? safeDiscount *
              (itemSubtotal /
                originalTotal)
            : 0;

        const finalItemTotal =
          Math.max(
            0,
            itemSubtotal -
              itemDiscount
          );

        const unitAmount =
          Math.max(
            1,
            Math.round(
              (finalItemTotal /
                Number(
                  item.quantity
                )) *
                100
            )
          );

        const variantText =
          item.variant
            ? ` — ${item.variant}`
            : "";

        return {
          quantity:
            Number(
              item.quantity
            ),

          price_data: {
            currency: "eur",

            unit_amount:
              unitAmount,

            product_data: {
              name:
                `${item.name}${variantText}`,

              metadata: {
                vendora_product_id:
                  String(
                    item.productId
                  ),
              },
            },
          },
        };
      });

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const checkoutSession =
      await stripe.checkout.sessions.create(
        {
          mode: "payment",

          customer_email:
            customerEmail,

          line_items:
            lineItems,

          metadata: {
            checkout_id:
              checkoutId,

            seller_id:
              ownerId,

            payment_type:
              "store_order",
          },

          payment_intent_data: {
            metadata: {
              checkout_id:
                checkoutId,

              seller_id:
                ownerId,

              payment_type:
                "store_order",
            },
          },

         success_url:
  `${siteUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}&checkout_id=${encodeURIComponent(
    checkoutId
  )}&store_slug=${encodeURIComponent(
    storeSlug
  )}`,
          cancel_url:
            `${siteUrl}/cart?payment=cancelled`,
        },
        {
          stripeAccount:
            seller.stripe_account_id,
        }
      );

    if (!checkoutSession.url) {
      return NextResponse.json(
        {
          error:
            "Stripe не върна адрес за плащане.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: checkoutSession.url,
      checkoutSessionId:
        checkoutSession.id,
    });
  } catch (error) {
    console.error(
      "Store Stripe Checkout error:",
      error
    );

    const details =
      error instanceof Error
        ? error.message
        : "Неизвестна Stripe грешка.";

    return NextResponse.json(
      {
        error:
          "Неуспешно създаване на Stripe плащането.",

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