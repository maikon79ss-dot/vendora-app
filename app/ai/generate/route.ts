import { NextResponse } from "next/server";
import OpenAI from "openai";

type GenerateBody = {
  tool: string;
  productName: string;
  details: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Липсва OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const body =
      (await request.json()) as GenerateBody;

    if (
      !body.tool ||
      !body.productName ||
      !body.details
    ) {
      return NextResponse.json(
        {
          error:
            "Моля, попълнете всички полета.",
        },
        { status: 400 }
      );
    }

    const prompt = `
Ти си AI помощник за онлайн магазини във Vendora.

Задача: ${body.tool}

Продукт: ${body.productName}

Допълнителна информация:
${body.details}

Отговори на български език.
Дай готов, практичен резултат, който продавачът може директно да използва.
Не добавяй излишни обяснения.
`;

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",
        input: prompt,
      });

    const result =
      response.output_text?.trim();

    if (!result) {
      return NextResponse.json(
        {
          error:
            "AI не върна резултат.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result,
    });
  } catch (error) {
    console.error(
      "Грешка при AI генериране:",
      error
    );

    return NextResponse.json(
      {
        error:
          "AI заявката не беше изпълнена.",
      },
      { status: 500 }
    );
  }
}