import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
export const runtime = "nodejs";
function canonicalize(value: any): any {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const result: Record<string, any> = {};

    for (const key of Object.keys(value).sort()) {
      result[key] = canonicalize(
        value[key]
      );
    }

    return result;
  }

  return value;
}

function createCodPayOptionKey(
  option: any
) {
  const payload = JSON.stringify(
    canonicalize(option)
  );

  return createHash("sha256")
    .update(payload)
    .digest("hex");
}
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

    const {
      data: connection,
      error: connectionError,
    } = await supabaseAdmin
      .from("econt_connections")
      .select(
        `
          client_id,
          sender_address_id,
         cod_pay_option_key,
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
let shipmentServices:
  | Record<string, any>
  | undefined;

if (hasCashOnDelivery) {
  const savedCodPayOptionKey =
    typeof connection.cod_pay_option_key ===
      "string"
      ? connection.cod_pay_option_key.trim()
      : "";

  if (!savedCodPayOptionKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Не е избран начин за изплащане на наложения платеж в настройките на Econt.",
        code: "ECONT_COD_OPTION_REQUIRED",
      },
      { status: 400 }
    );
  }

  const cdPayOptions =
    Array.isArray(
      selectedProfile.cdPayOptions
    )
      ? selectedProfile.cdPayOptions
      : [];

  const selectedCodPayOption =
    cdPayOptions.find(
      (option: any) =>
        createCodPayOptionKey(
          option
        ) === savedCodPayOptionKey
    );

  if (!selectedCodPayOption) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Запазеният начин за изплащане вече не е наличен в Econt профила. Изберете го отново в Настройки.",
        code: "ECONT_COD_OPTION_NOT_FOUND",
      },
      { status: 400 }
    );
  }

  const cdAmount = Number(
    orders
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total_price || 0
          ),
        0
      )
      .toFixed(2)
  );

  if (
    !Number.isFinite(cdAmount) ||
    cdAmount <= 0
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Невалидна сума за наложен платеж.",
      },
      { status: 400 }
    );
  }

  shipmentServices = {
    cdAmount,
    cdType: "get",
    cdCurrency: "EUR",
    cdPayOptions:
      selectedCodPayOption,
  };
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

      const createPayload = {
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

        paymentReceiverMethod: "cash",
        paymentReceiverAmount: 100,
        paymentReceiverAmountIsPercent: true,

        ...(shipmentServices
          ? { services: shipmentServices }
          : {}),
      },

      mode: "create",
    };

    const {
      data: existingShipment,
      error: existingShipmentError,
    } = await supabaseAdmin
      .from("econt_shipments")
      .select(
        "status, shipment_number"
      )
      .eq("owner_id", user.id)
      .eq("checkout_id", checkoutId)
      .maybeSingle();

    if (existingShipmentError) {
      console.error(
        "Econt existing shipment load error:",
        existingShipmentError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Не можа да бъде проверено дали вече има товарителница.",
        },
        { status: 500 }
      );
    }

    if (
      existingShipment?.status ===
        "created" &&
      existingShipment.shipment_number
    ) {
      return NextResponse.json({
        ok: true,
        alreadyCreated: true,
        message:
          "За тази поръчка вече има създадена Econt товарителница.",
        shipment: {
          checkoutId,
          shipmentNumber:
            existingShipment.shipment_number,
        },
      });
    }

    if (
      existingShipment?.status ===
      "creating"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "За тази поръчка вече се създава товарителница. Не опитвайте повторно.",
        },
        { status: 409 }
      );
    }

    if (
      existingShipment &&
      existingShipment.status !== "failed"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "За тази поръчка вече има запис за Econt товарителница.",
        },
        { status: 409 }
      );
    }

    const now =
      new Date().toISOString();

    if (
      existingShipment?.status ===
      "failed"
    ) {
      const {
        data: retryReservation,
        error: retryReservationError,
      } = await supabaseAdmin
        .from("econt_shipments")
        .update({
          status: "creating",
          shipment_number: null,
          last_error: null,
          updated_at: now,
        })
        .eq("owner_id", user.id)
        .eq("checkout_id", checkoutId)
        .eq("status", "failed")
        .select("status")
        .maybeSingle();

      if (
        retryReservationError ||
        !retryReservation
      ) {
        console.error(
          "Econt retry reservation error:",
          retryReservationError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Товарителницата не можа да бъде подготвена за нов опит.",
          },
          { status: 409 }
        );
      }
    } else {
      const {
        error: reservationError,
      } = await supabaseAdmin
        .from("econt_shipments")
        .insert({
          owner_id: user.id,
          checkout_id: checkoutId,
          status: "creating",
          shipment_number: null,
          last_error: null,
          updated_at: now,
        });

      if (reservationError) {
        console.error(
          "Econt shipment reservation error:",
          reservationError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "За тази поръчка вече се създава или съществува товарителница.",
          },
          { status: 409 }
        );
      }
    }

    let createResponse: Response;

    try {
      createResponse = await fetch(
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
            createPayload
          ),
          cache: "no-store",
        }
      );
    } catch (error) {
      console.error(
        "Econt shipment create network error:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Не е получен сигурен отговор от Econt. Не опитвайте повторно, за да не бъде създадена втора товарителница.",
        },
        { status: 502 }
      );
    }

    let createData: any = null;

    try {
      createData =
        await createResponse.json();
    } catch {
      createData = null;
    }

    if (!createResponse.ok) {
      const econtError =
        getEcontErrorMessage(
          createData
        );

      const {
        error: failedSaveError,
      } = await supabaseAdmin
        .from("econt_shipments")
        .update({
          status: "failed",
          last_error: econtError,
          updated_at:
            new Date().toISOString(),
        })
        .eq("owner_id", user.id)
        .eq("checkout_id", checkoutId)
        .eq("status", "creating");

      if (failedSaveError) {
        console.error(
          "Econt failed shipment save error:",
          failedSaveError
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: econtError,
          econtFields:
            Array.isArray(
              createData?.fields
            )
              ? createData.fields
              : [],
        },
        { status: 400 }
      );
    }

    const createdLabel =
      createData?.label || {};

    const shipmentNumber =
      typeof createdLabel.shipmentNumber ===
      "string"
        ? createdLabel.shipmentNumber.trim()
        : String(
            createdLabel.shipmentNumber ||
              ""
          ).trim();

    if (!shipmentNumber) {
      console.error(
        "Econt create shipment returned no shipment number:",
        createData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt отговори, но не върна номер на товарителница. Не опитвайте повторно.",
        },
        { status: 502 }
      );
    }

    const {
      error: shipmentSaveError,
    } = await supabaseAdmin
      .from("econt_shipments")
      .update({
        status: "created",
        shipment_number:
          shipmentNumber,
        last_error: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("owner_id", user.id)
      .eq("checkout_id", checkoutId)
      .eq("status", "creating");

    if (shipmentSaveError) {
      console.error(
        "Econt created shipment save error:",
        shipmentSaveError
      );
    }

    const {
      error: trackingUpdateError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        tracking_number:
          shipmentNumber,
      })
      .eq("checkout_id", checkoutId)
      .eq("owner_id", user.id);

    if (trackingUpdateError) {
      console.error(
        "Econt tracking number update error:",
        trackingUpdateError
      );
    }

    const saveWarning =
      shipmentSaveError ||
      trackingUpdateError
        ? "Товарителницата е създадена в Econt, но част от данните не можаха да бъдат записани във Vendora. Не създавайте втора товарителница."
        : null;

    return NextResponse.json({
      ok: true,
      alreadyCreated: false,

      message:
        "Econt товарителницата е създадена успешно.",

      warning: saveWarning,

      shipment: {
        checkoutId,

        shipmentNumber,

        receiverOfficeCode,

        weight,

        packCount,

        shipmentType: "pack",

        shipmentDescription,

        totalPrice:
          typeof createdLabel.totalPrice ===
          "number"
            ? createdLabel.totalPrice
            : null,

        currency:
          createdLabel.currency || null,

        senderDueAmount:
          typeof createdLabel.senderDueAmount ===
          "number"
            ? createdLabel.senderDueAmount
            : null,

        receiverDueAmount:
          typeof createdLabel.receiverDueAmount ===
          "number"
            ? createdLabel.receiverDueAmount
            : null,

        expectedDeliveryDate:
          createdLabel.expectedDeliveryDate ||
          null,

        pdfURL:
          createdLabel.pdfURL || null,
      },
    });
  } catch (error) {
    console.error(
      "Econt create shipment route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при създаването на Econt товарителницата.",
      },
      { status: 500 }
    );
  }
}
