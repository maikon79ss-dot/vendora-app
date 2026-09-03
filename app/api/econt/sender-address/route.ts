import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

    const senderAddressId =
      Number(body?.senderAddressId);

    if (
      !Number.isInteger(senderAddressId) ||
      senderAddressId <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Невалиден Econt адрес на подателя.",
        },
        { status: 400 }
      );
    }

    const {
      data: connection,
      error: connectionError,
    } = await supabaseAdmin
      .from("econt_connections")
      .select("client_id, is_connected")
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

    const basicAuth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const baseUrl =
      econtApiUrl.replace(/\/+$/, "");

    const econtResponse = await fetch(
      `${baseUrl}/Profile/ProfileService.getClientProfiles.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        cache: "no-store",
      }
    );

    let econtData: any = null;

    try {
      econtData = await econtResponse.json();
    } catch {
      econtData = null;
    }

    if (!econtResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            econtData?.message ||
            "Econt профилът не можа да бъде проверен.",
        },
        { status: 400 }
      );
    }

    const profiles =
      Array.isArray(econtData?.profiles)
        ? econtData.profiles
        : [];

    const selectedProfile =
      profiles.find(
        (profile: any) =>
          profile?.client?.id ===
          connection.client_id
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
      Array.isArray(selectedProfile.addresses)
        ? selectedProfile.addresses
        : [];

    const addressExists = addresses.some(
      (address: any) =>
        Number(address?.id) === senderAddressId
    );

    if (!addressExists) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Избраният адрес не принадлежи на този Econt акаунт.",
        },
        { status: 400 }
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("econt_connections")
        .update({
          sender_address_id: senderAddressId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Econt sender address save error:",
        updateError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Адресът на подателя не можа да бъде записан.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      senderAddressId,
    });
  } catch (error) {
    console.error(
      "Econt sender address route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при записването на Econt адреса.",
      },
      { status: 500 }
    );
  }
}
