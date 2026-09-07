import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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
          error:
            "Липсва server configuration.",
        },
        { status: 500 }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const ownerId =
      searchParams.get("ownerId")?.trim() ||
      "";

    const cityIdParam =
      searchParams.get("cityId")?.trim() ||
      "";

    const cityID =
      Number(cityIdParam);

    if (!ownerId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Липсва идентификатор на магазина.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(cityID) ||
      cityID <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Невалидно населено място.",
        },
        { status: 400 }
      );
    }

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
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("econt_enabled")
      .eq("id", ownerId)
      .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.econt_enabled !== true
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt не е активиран за този магазин.",
        },
        { status: 400 }
      );
    }

    const {
      data: connection,
      error: connectionError,
    } = await supabaseAdmin
      .from("econt_connections")
      .select("is_connected")
      .eq("user_id", ownerId)
      .maybeSingle();

    if (
      connectionError ||
      !connection ||
      connection.is_connected !== true
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt акаунтът на магазина не е свързан.",
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
        p_user_id: ownerId,
      }
    );

    if (credentialsError) {
      console.error(
        "Econt public offices credentials error:",
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
            "Липсват Econt данни за магазина.",
        },
        { status: 400 }
      );
    }

    const basicAuth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const baseUrl =
      econtApiUrl.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/Nomenclatures/NomenclaturesService.getOffices.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Basic ${basicAuth}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          countryCode: "BGR",
          cityID,
        }),
        cache: "no-store",
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      console.error(
        "Econt public offices API error:",
        data
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt не можа да зареди офисите.",
        },
        { status: 400 }
      );
    }

    const offices =
      Array.isArray(data?.offices)
        ? data.offices
        : [];

   

  const simplifiedOffices =
  offices.map(
        (office: any) => ({
          id: office?.id,
          code: office?.code || null,
          name: office?.name,
          address: {
            fullAddress:
              office?.address
                ?.fullAddress || null,
          },
        })
      );

    return NextResponse.json({
      ok: true,
      cityID,
      officeCount:
        simplifiedOffices.length,
      offices: simplifiedOffices,
    });
  } catch (error) {
    console.error(
      "Econt public offices route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при зареждането на офисите.",
      },
      { status: 500 }
    );
  }
}
