import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const baseUrl = process.env.ECONT_API_URL;
    const username = process.env.ECONT_USERNAME;
    const password = process.env.ECONT_PASSWORD;

    if (!baseUrl || !username || !password) {
      return NextResponse.json(
        {
          ok: false,
          error: "Econt configuration is missing.",
        },
        { status: 500 }
      );
    }

    const endpoint = `${baseUrl.replace(
      /\/$/,
      ""
    )}/Nomenclatures/NomenclaturesService.getOffices.json`;

    const auth = Buffer.from(
      `${username}:${password}`
    ).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        countryCode: "BGR",
        cityID: 41,
      }),
      cache: "no-store",
    });

    const responseText = await response.text();

   let data: Record<string, unknown>;

try {
  data = JSON.parse(responseText) as Record<string, unknown>;
} catch {
  data = {
    rawResponse: responseText,
  };
}

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Econt returned an error.",
          details: data,
        },
        { status: response.status }
      );
    }

   const offices = Array.isArray(data.offices)
  ? data.offices
  : [];

    return NextResponse.json({
      ok: true,
      message: "Econt Demo connection works.",
      officeCount: offices.length,
      offices: offices.slice(0, 10),
    });
  } catch (error) {
    console.error("Econt offices error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to connect to Econt.",
      },
      { status: 500 }
    );
  }
}
