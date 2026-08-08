import { NextResponse } from "next/server";
import { Resend } from "resend";

type SendTestEmailBody = {
  to?: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Липсва RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const body =
      (await request.json()) as SendTestEmailBody;

    if (!body.to) {
      return NextResponse.json(
        { error: "Липсва имейл адрес." },
        { status: 400 }
      );
    }

    const { data, error } =
      await resend.emails.send({
        from: "Vendora <notifications@vendora.trade>",
        to: [body.to],
        subject: "Тестов имейл от Vendora",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Vendora работи успешно ✅</h2>
            <p>Това е тестово съобщение от системата за имейли.</p>
          </div>
        `,
      });

    if (error) {
      console.error(
        "Resend отказа тестовия имейл:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Грешка при тестовия имейл:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Тестовият имейл не беше изпратен.",
      },
      { status: 500 }
    );
  }
}
