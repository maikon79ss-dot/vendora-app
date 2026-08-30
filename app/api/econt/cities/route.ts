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
    )}/Nomenclatures/NomenclaturesService.getCities.json`;

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

    const cities = Array.isArray(data.cities)
      ? data.cities
      : [];

    const simplifiedCities = cities.map((city) => {
      const cityData = city as Record<string, unknown>;

      return {
        id: cityData.id,
        name: cityData.name,
        postCode: cityData.postCode,
      };
    });

    return NextResponse.json({
      ok: true,
      message: "Econt cities loaded successfully.",
      cityCount: simplifiedCities.length,
      cities: simplifiedCities,
    });
  } catch (error) {
    console.error("Econt cities error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load Econt cities.",
      },
      { status: 500 }
    );
  }
}
