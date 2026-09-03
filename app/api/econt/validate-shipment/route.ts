import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getEcontErrorMessage(data: any) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (
    Array.isArray(data?.innerErrors) &&
    data.innerErrors.length > 0
  ) {
    const messages = data.innerErrors
      .map((error: any) => error?.message)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (
    Array.isArray(data?.fields) &&
    data.fields.length > 0
  ) {
    return `Проверете полетата: ${data.fields.join(", ")}`;
  }

  return "Econt не прие данните за пратката.";
}

export async function POST(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    const econtApiUrl =
      process.env.ECONT_PRODUCTION_API_URL;

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !econtApiUrl
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Липсва server configuration.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Не сте влезли в профила си.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.slice(7);

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

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Невалидна потребителска сесия.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const checkoutId =
      typeof body?.checkoutId === "string"
        ? body.checkoutId.trim()
        : "";

    const weight =
      Number(body?.weight);

    const packCount =
      Number(body?.packCount);

    if (!checkoutId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Липсва номер на поръчката.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Въведете валидно тегло на пратката.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(packCount) ||
      packCount <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Броят пакети трябва да бъде положително цяло число.",
        },
        { status: 400 }
      );
    }

    const {
      data: orders,
      error: ordersError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
          id,
          checkout_id,
          owner_id,
          product_name,
          quantity,
          customer_name,
          customer_email,
          customer_phone,
          address,
          city,
          postal_code,
          payment_method,
          total_price,
          econt_office_code
        `
      )
      .eq("checkout_id", checkoutId)
      .eq("owner_id", user.id);

    if (ordersError) {
      console.error(
        "Econt order load error:",
        ordersError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Поръчката не можа да бъде заредена.",
        },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Поръчката не е намерена или не принадлежи на този магазин.",
        },
        { status: 404 }
      );
    }

    const firstOrder = orders[0];

    if (
      !firstOrder.address?.startsWith(
        "Econt офис:"
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Тази поръчка не е за доставка до офис на Econt.",
        },
        { status: 400 }
      );
    }

    const receiverOfficeCode =
      typeof firstOrder.econt_office_code ===
        "string"
        ? firstOrder.econt_office_code.trim()
        : "";

    if (!receiverOfficeCode) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Липсва Econt код на офиса на получателя.",
        },
        { status: 400 }
      );
    }

    if (
      !firstOrder.customer_name ||
      !firstOrder.customer_phone
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Липсват име или телефон на получателя.",
        },
        { status: 400 }
      );
    }

    const hasCashOnDelivery =
      orders.some((order) =>
        String(
          order.payment_method || ""
        )
          .toLowerCase()
          .includes("наложен")
      );

    if (hasCashOnDelivery) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Поръчката е с наложен платеж. Първо трябва да настроим начина за изплащане на наложения платеж в Econt.",
          code: "ECONT_COD_NOT_CONFIGURED",
        },
        { status: 400 }
      );
    }

    const {
      data: connection,
      error: connectionError,
    } = await supabaseAdmin
      .from("econt_connections")
      .select(
        `
          client_id,
          sender_address_id,
          is_connected
        `
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      connectionError ||
      !connection ||
      !connection.is_connected
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt акаунтът не е свързан.",
        },
        { status: 400 }
      );
    }

    if (!connection.sender_address_id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не е избран адрес на подателя в настройките на Econt.",
        },
        { status: 400 }
      );
    }

    const {
      data: credentialsData,
      error: credentialsError,
    } = await supabaseAdmin.rpc(
      "get_econt_credentials_for_server",
      {
        p_user_id: user.id,
      }
    );

    if (credentialsError) {
      console.error(
        "Econt credentials load error:",
        credentialsError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt данните не можаха да бъдат заредени.",
        },
        { status: 500 }
      );
    }

    const credentials =
      Array.isArray(credentialsData)
        ? credentialsData[0]
        : null;

    const username =
      credentials?.username || "";

    const password =
      credentials?.password || "";

    if (!username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Липсват запазени Econt данни.",
        },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const baseUrl =
      econtApiUrl.replace(/\/+$/, "");

    const profileResponse = await fetch(
      `${baseUrl}/Profile/ProfileService.getClientProfiles.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Basic ${basicAuth}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({}),
        cache: "no-store",
      }
    );

    let profileData: any = null;

    try {
      profileData =
        await profileResponse.json();
    } catch {
      profileData = null;
    }

    if (!profileResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            getEcontErrorMessage(
              profileData
            ),
        },
        { status: 400 }
      );
    }

    const profiles =
      Array.isArray(profileData?.profiles)
        ? profileData.profiles
        : [];

    const selectedProfile =
      profiles.find(
        (profile: any) =>
          Number(profile?.client?.id) ===
          Number(connection.client_id)
      ) || profiles[0];

    if (!selectedProfile?.client) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не е намерен Econt клиентски профил.",
        },
        { status: 400 }
      );
    }

    const senderAddresses =
      Array.isArray(
        selectedProfile.addresses
      )
        ? selectedProfile.addresses
        : [];

    const senderAddress =
      senderAddresses.find(
        (address: any) =>
          Number(address?.id) ===
          Number(
            connection.sender_address_id
          )
      );

    if (!senderAddress) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Запазеният адрес на подателя вече не е наличен в Econt профила.",
        },
        { status: 400 }
      );
    }

    const shipmentDescription =
      orders
        .map((order) => {
          const name =
            String(
              order.product_name || ""
            ).trim();

          const quantity =
            Number(order.quantity || 0);

          return quantity > 1
            ? `${name} x${quantity}`
            : name;
        })
        .filter(Boolean)
        .join(", ")
        .slice(0, 200) ||
      "Vendora поръчка";

    const receiverClient: {
      name: string;
      phones: string[];
      email?: string;
    } = {
      name:
        firstOrder.customer_name.trim(),
      phones: [
        firstOrder.customer_phone.trim(),
      ],
    };

    if (
      typeof firstOrder.customer_email ===
        "string" &&
      firstOrder.customer_email.trim()
    ) {
      receiverClient.email =
        firstOrder.customer_email.trim();
    }

    const validationPayload = {
      label: {
        senderClient:
          selectedProfile.client,

        senderAddress,

        receiverClient,

        receiverOfficeCode,

        packCount,

        shipmentType: "pack",

        weight,

        shipmentDescription,

        orderNumber: checkoutId,
      },

      mode: "validate",
    };

    const validationResponse =
      await fetch(
        `${baseUrl}/Shipments/LabelService.createLabel.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Basic ${basicAuth}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            validationPayload
          ),
          cache: "no-store",
        }
      );

    let validationData: any = null;

    try {
      validationData =
        await validationResponse.json();
    } catch {
      validationData = null;
    }

    if (!validationResponse.ok) {
      console.error(
        "Econt shipment validation error:",
        validationData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            getEcontErrorMessage(
              validationData
            ),
          econtFields:
            Array.isArray(
              validationData?.fields
            )
              ? validationData.fields
              : [],
        },
        { status: 400 }
      );
    }

    const validatedLabel =
      validationData?.label || {};

    return NextResponse.json({
      ok: true,

      message:
        "Econt прие данните за пратката като валидни.",

      validation: {
        checkoutId,

        receiverOfficeCode,

        weight,

        packCount,

        shipmentType: "pack",

        shipmentDescription,

        totalPrice:
          typeof validatedLabel.totalPrice ===
          "number"
            ? validatedLabel.totalPrice
            : null,

        currency:
          validatedLabel.currency || null,

        expectedDeliveryDate:
          validatedLabel.expectedDeliveryDate ||
          null,

        warnings:
          validatedLabel.warnings ||
          validationData?.delayedDeliveryWarning ||
          validationData?.delayedRequestWarning ||
          null,
      },
    });
  } catch (error) {
    console.error(
      "Econt validate shipment route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при проверката на Econt пратката.",
      },
      { status: 500 }
    );
  }
}
