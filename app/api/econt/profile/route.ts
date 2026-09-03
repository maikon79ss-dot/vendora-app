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

function createCodPayOptionLabel(
  option: any
) {
  const method = String(
    option?.method || ""
  ).toLowerCase();

  if (method === "bank") {
    const iban =
      typeof option?.IBAN === "string"
        ? option.IBAN.replace(/\s+/g, "")
        : "";

    const last4 =
      iban.length >= 4
        ? iban.slice(-4)
        : "";

    const currency =
      option?.bankCurrency
        ? ` ${option.bankCurrency}`
        : "";

    return last4
      ? `Банков превод ••••${last4}${currency}`
      : `Банков превод${currency}`;
  }

  if (method === "office") {
    return option?.officeCode
      ? `Получаване в офис на Econt (${option.officeCode})`
      : "Получаване в офис на Econt";
  }

  if (method === "door") {
    return "Получаване на адрес";
  }

  if (option?.moneyTransfer === true) {
    return "Пощенски паричен превод";
  }

  return "Начин за изплащане от Econt";
}

export async function GET(
  request: Request
) {
  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;

    const econtApiUrl =
      process.env
        .ECONT_PRODUCTION_API_URL;

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !econtApiUrl
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Липсва server configuration.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Не сте влезли в профила си.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.slice(7);

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

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Невалидна потребителска сесия.",
        },
        { status: 401 }
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
          client_name,
          client_number,
          is_connected,
          sender_address_id,
          cod_pay_option_key
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

    const basicAuth =
      Buffer.from(
        `${username}:${password}`
      ).toString("base64");

    const baseUrl =
      econtApiUrl.replace(
        /\/+$/,
        ""
      );

    const econtResponse =
      await fetch(
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

    let econtData: any = null;

    try {
      econtData =
        await econtResponse.json();
    } catch {
      econtData = null;
    }

    if (!econtResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            econtData?.message ||
            "Econt профилът не можа да бъде зареден.",
        },
        { status: 400 }
      );
    }

    const profiles =
      Array.isArray(
        econtData?.profiles
      )
        ? econtData.profiles
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

    const addresses =
      Array.isArray(
        selectedProfile.addresses
      )
        ? selectedProfile.addresses
        : [];

    const safeAddresses =
      addresses.map(
        (address: any) => ({
          id:
            typeof address?.id ===
            "number"
              ? address.id
              : null,

          fullAddress:
            address?.fullAddress || "",

          zip:
            address?.zip || "",

          quarter:
            address?.quarter || "",

          street:
            address?.street || "",

          num:
            address?.num || "",

          other:
            address?.other || "",

          city: {
            id:
              typeof address?.city
                ?.id === "number"
                ? address.city.id
                : null,

            name:
              address?.city?.name || "",

            postCode:
              address?.city
                ?.postCode || "",
          },
        })
      );

    const cdPayOptions =
      Array.isArray(
        selectedProfile.cdPayOptions
      )
        ? selectedProfile.cdPayOptions
        : [];

    const safeCodPayOptions =
      cdPayOptions.map(
        (option: any) => ({
          key:
            createCodPayOptionKey(
              option
            ),

          method: String(
            option?.method || ""
          ).toLowerCase(),

          label:
            createCodPayOptionLabel(
              option
            ),

          moneyTransfer:
            option?.moneyTransfer ===
            true,
        })
      );

    const savedCodPayOptionKey =
      connection.cod_pay_option_key ||
      null;

    const validCodPayOptionKey =
      savedCodPayOptionKey &&
      safeCodPayOptions.some(
        (option: any) =>
          option.key ===
          savedCodPayOptionKey
      )
        ? savedCodPayOptionKey
        : null;

    return NextResponse.json({
      ok: true,

      profile: {
        clientId:
          selectedProfile.client.id ||
          null,

        clientName:
          selectedProfile.client
            .name || "",

        clientNumber:
          selectedProfile.client
            .clientNumber || "",

        senderAddressId:
          connection.sender_address_id ||
          null,

        addresses:
          safeAddresses,

        codPayOptionKey:
          validCodPayOptionKey,

        codPayOptions:
          safeCodPayOptions,
      },
    });
  } catch (error) {
    console.error(
      "Econt profile route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при зареждането на Econt профила.",
      },
      { status: 500 }
    );
  }
}
