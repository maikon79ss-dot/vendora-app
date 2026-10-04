import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type DeepLResponse = {
  translations?: {
    text: string;
  }[];
  message?: string;
};

export async function POST(
  request: NextRequest
) {
  const apiKey =
    process.env.DEEPL_API_KEY;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Липсва DEEPL_API_KEY.",
      },
      { status: 500 }
    );
  }

  if (
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    return NextResponse.json(
      {
        error:
          "Липсват Supabase настройки.",
      },
      { status: 500 }
    );
  }

  const authorization =
    request.headers.get("authorization");

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Необходим е вход в профила.",
      },
      { status: 401 }
    );
  }

  const accessToken =
    authorization.slice(7);

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(
    accessToken
  );

  if (authError || !user) {
    return NextResponse.json(
      {
        error:
          "Невалидна потребителска сесия.",
      },
      { status: 401 }
    );
  }

  try {
    const body =
      await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body?.description ===
      "string"
        ? body.description.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Липсва име на продукта.",
        },
        { status: 400 }
      );
    }

    const texts = description
      ? [name, description]
      : [name];

    const response = await fetch(
      "https://api.deepl.com/v2/translate",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `DeepL-Auth-Key ${apiKey}`,
        },
        body: JSON.stringify({
          text: texts,
          source_lang: "BG",
          target_lang: "EN-GB",
        }),
      }
    );

    const data =
      (await response.json()) as DeepLResponse;

    if (!response.ok) {
      console.error(
        "DeepL translation error:",
        data
      );

      return NextResponse.json(
        {
          error:
            "Неуспешен превод с DeepL.",
        },
        { status: 502 }
      );
    }

    const nameEn =
      data.translations?.[0]?.text ||
      name;

    const descriptionEn =
      description
        ? data.translations?.[1]
            ?.text || description
        : "";

    return NextResponse.json({
      name_en: nameEn,
      description_en: descriptionEn,
    });
  } catch (error) {
    console.error(
      "Translation route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Грешка при превода.",
      },
      { status: 500 }
    );
  }
}
