import { NextResponse } from "next/server";
import { Resend } from "resend";

type SendOrderEmailBody = {
  to: string;
  subject: string;
  message: string;
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
      (await request.json()) as SendOrderEmailBody;

    if (
      !body.to ||
      !body.subject ||
      !body.message
    ) {
      return NextResponse.json(
        {
          error:
            "Липсват данни за имейла.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await resend.emails.send({
        from: "Vendora <onboarding@resend.dev>",
        to: [body.to],
        subject: body.subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            ${body.message
              .split("\n")
              .map(
                (line) =>
                  `<p>${line || "&nbsp;"}</p>`
              )
              .join("")}
          </div>
        `,
      });

    if (error) {
      console.error(
        "Resend отказа имейла:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.log(
      "Имейлът е изпратен успешно:",
      data
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Грешка при изпращане на имейл:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Имейлът не беше изпратен.",
      },
      { status: 500 }
    );
  }
}