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

    const accessToken = authorization.slice(7);

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

    const username =
      typeof body?.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (!username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Въведете Econt потребителско име и парола.",
        },
        { status: 400 }
      );
    }

    const baseUrl =
      econtApiUrl.replace(/\/+$/, "");

    const basicAuth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

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
            "Econt не прие въведените данни.",
        },
        { status: 400 }
      );
    }

    const profiles = Array.isArray(
      econtData?.profiles
    )
      ? econtData.profiles
      : [];

    const client = profiles[0]?.client;

    if (!client) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt акаунтът не върна клиентски профил.",
        },
        { status: 400 }
      );
    }

    const { error: secretError } =
      await supabaseAdmin.rpc(
        "save_econt_credentials",
        {
          p_user_id: user.id,
          p_username: username,
          p_password: password,
        }
      );

    if (secretError) {
      console.error(
        "Econt Vault save error:",
        secretError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt данните не можаха да бъдат записани защитено.",
        },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    const { error: connectionError } =
      await supabaseAdmin
        .from("econt_connections")
        .upsert(
          {
            user_id: user.id,
            client_id:
              typeof client.id === "number"
                ? client.id
                : null,
            client_number:
              client.clientNumber || null,
            client_name:
              client.name || null,
            is_connected: true,
            connected_at: now,
            updated_at: now,
          },
          {
            onConflict: "user_id",
          }
        );

    if (connectionError) {
      console.error(
        "Econt connection save error:",
        connectionError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Econt връзката не можа да бъде записана.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      connection: {
        clientName: client.name || "",
        clientNumber:
          client.clientNumber || "",
      },
    });
  } catch (error) {
    console.error(
      "Econt connect route error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Възникна грешка при свързването с Econt.",
      },
      { status: 500 }
    );
  }
}
