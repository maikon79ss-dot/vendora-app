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
  throw new Error("Липсват сървърните настройки за Supabase.");
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

type ConfirmPaymentBody = {
  sessionId?: string;
  checkoutId?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConfirmPaymentBody;

    const sessionId = body.sessionId?.trim();
    const checkoutId = body.checkoutId?.trim();

    if (!sessionId || !checkoutId) {
      return NextResponse.json(
        {
          error:
            "Липсва Stripe сесия или номер на поръчката.",
        },
        { status: 400 }
      );
    }

    /*
     * Намираме поръчката, за да разберем
     * кой е продавачът.
     */
    const {
      data: orderRows,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        owner_id,
        customer_name,
        customer_email,
        product_name,
        quantity,
        total_price,
        status,
        payment_method
        `
      )
      .eq("checkout_id", checkoutId);

    if (orderError) {
      console.error(
        "Order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Поръчката не можа да бъде намерена.",
        },
        { status: 500 }
      );
    }

    if (!orderRows || orderRows.length === 0) {
      return NextResponse.json(
        { error: "Поръчката не беше намерена." },
        { status: 404 }
      );
    }

    const ownerId = orderRows[0].owner_id;

    if (!ownerId) {
      return NextResponse.json(
        {
          error:
            "Поръчката няма свързан продавач.",
        },
        { status: 400 }
      );
    }

    /*
     * Намираме Stripe Connected Account
     * на продавача.
     */
    const {
      data: seller,
      error: sellerError,
    } = await supabaseAdmin
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", ownerId)
      .single();

    if (
      sellerError ||
      !seller?.stripe_account_id
    ) {
      console.error(
        "Seller Stripe account error:",
        sellerError
      );

      return NextResponse.json(
        {
          error:
            "Stripe акаунтът на продавача не беше намерен.",
        },
        { status: 404 }
      );
    }

    /*
     * Direct charge Checkout Session трябва
     * да се прочете от Connected Account.
     */
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(
        sessionId,
        {},
        {
          stripeAccount:
            seller.stripe_account_id,
        }
      );

    /*
     * Проверяваме, че Stripe сесията е точно
     * за тази Vendora поръчка.
     */
    if (
      checkoutSession.metadata?.payment_type !==
        "store_order" ||
      checkoutSession.metadata?.checkout_id !==
        checkoutId ||
      checkoutSession.metadata?.seller_id !==
        ownerId
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe сесията не съответства на поръчката.",
        },
        { status: 400 }
      );
    }

    if (
      checkoutSession.payment_status !== "paid"
    ) {
      return NextResponse.json(
        {
          error:
            "Плащането все още не е потвърдено.",
          paymentStatus:
            checkoutSession.payment_status,
        },
        { status: 400 }
      );
    }

    const alreadyPaid = orderRows.every(
      (order) => order.status === "Платена"
    );

    /*
     * Обновяваме всички редове от същата поръчка.
     */
    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          status: "Платена",
          payment_method: "Stripe",
        })
        .eq("checkout_id", checkoutId);

    if (updateError) {
      console.error(
        "Order update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Поръчката не можа да бъде отбелязана като платена.",
        },
        { status: 500 }
      );
    }

    /*
     * Изпращаме имейл само при първото
     * успешно потвърждение.
     */
    if (!alreadyPaid) {
      const firstOrder = orderRows[0];

      const products = orderRows
        .map(
          (order) =>
            `${order.product_name} × ${order.quantity}`
        )
        .join("\n");

      const total = orderRows.reduce(
        (sum, order) =>
          sum +
          Number(order.total_price || 0),
        0
      );

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000";

      try {
        const emailResponse = await fetch(
          `${siteUrl}/api/send-order-email`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              to: firstOrder.customer_email,
              subject:
                "Потвърждение за платена поръчка",
              message: `Здравейте, ${firstOrder.customer_name}!

Вашето плащане беше потвърдено успешно.

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

        if (!emailResponse.ok) {
          console.error(
            "Paid order email failed:",
            await emailResponse.text()
          );
        }
      } catch (emailError) {
        console.error(
          "Paid order email error:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      status: "Платена",
      checkoutId,
    });
  } catch (error) {
    console.error(
      "Confirm store payment error:",
      error
    );

    const details =
      error instanceof Error
        ? error.message
        : "Неизвестна грешка.";

    return NextResponse.json(
      {
        error:
          "Плащането не можа да бъде потвърдено.",
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